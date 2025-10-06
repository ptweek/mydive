import { PrismaClient, type Prisma } from "@prisma/client";

interface SyncConfig {
  sourceDatabaseUrl: string;
  targetDatabaseUrl: string;
  batchSize?: number;
}

interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
  duration: number;
}

// Extract model names from PrismaClient, excluding internal properties
type ModelName = Exclude<
  keyof PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$queryRaw"
  | "$queryRawUnsafe"
>;

// Type for records with an id field
type RecordWithId = Record<string, unknown> & {
  id: string | number;
};

class DatabaseSyncService {
  private sourceDb: PrismaClient;
  private targetDb: PrismaClient;
  private batchSize: number;

  constructor(config: SyncConfig) {
    this.sourceDb = new PrismaClient({
      datasources: { db: { url: config.sourceDatabaseUrl } },
    });

    this.targetDb = new PrismaClient({
      datasources: { db: { url: config.targetDatabaseUrl } },
    });

    this.batchSize = config.batchSize ?? 100;
  }

  /**
   * Sync a specific table from source to target using Prisma delegates
   */
  async syncTable<T extends ModelName>(tableName: T): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let recordsSynced = 0;

    try {
      console.log(`Starting sync for table: ${String(tableName)}`);

      // Access delegates - using unknown for type safety
      const sourceDelegate = this.sourceDb[tableName] as unknown as {
        findMany: (args?: unknown) => Promise<RecordWithId[]>;
      };
      const targetDelegate = this.targetDb[tableName] as unknown as {
        upsert: (args: {
          where: { id: string | number };
          update: RecordWithId;
          create: RecordWithId;
        }) => Prisma.PrismaPromise<RecordWithId>;
      };

      // Get all records from source (you can add filtering/pagination here)
      const sourceRecords = await sourceDelegate.findMany();

      console.log(`Found ${sourceRecords.length} records to sync`);

      // Sync in batches to avoid memory issues
      for (let i = 0; i < sourceRecords.length; i += this.batchSize) {
        const batch = sourceRecords.slice(i, i + this.batchSize);

        try {
          // Use transaction for batch safety
          await this.targetDb.$transaction(
            batch.map((record: RecordWithId) =>
              targetDelegate.upsert({
                where: { id: record.id },
                update: record,
                create: record,
              }),
            ),
          );

          recordsSynced += batch.length;
          console.log(
            `Synced batch ${Math.floor(i / this.batchSize) + 1}: ${batch.length} records`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`Batch ${i}-${i + this.batchSize}: ${errorMessage}`);
          console.error(`Error syncing batch:`, error);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Sync completed in ${duration}ms`);

      return {
        success: errors.length === 0,
        recordsSynced,
        errors,
        duration,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Fatal error: ${errorMessage}`);
      return {
        success: false,
        recordsSynced,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Sync multiple tables in sequence
   */
  async syncTables(
    tableNames: ModelName[],
  ): Promise<Record<string, SyncResult>> {
    const results: Record<string, SyncResult> = {};

    for (const tableName of tableNames) {
      console.log(`\n=== Syncing ${String(tableName)} ===`);
      results[String(tableName)] = await this.syncTable(tableName);
    }

    return results;
  }

  /**
   * Incremental sync - only sync records modified after a certain date
   */
  async syncTableIncremental<T extends ModelName>(
    tableName: T,
    lastSyncDate: Date,
    dateField = "updatedAt",
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let recordsSynced = 0;

    try {
      console.log(
        `Starting incremental sync for ${String(tableName)} since ${lastSyncDate.toDateString()}`,
      );

      // Access delegates - using unknown for type safety
      const sourceDelegate = this.sourceDb[tableName] as unknown as {
        findMany: (args?: {
          where?: Record<string, unknown>;
        }) => Promise<RecordWithId[]>;
      };
      const targetDelegate = this.targetDb[tableName] as unknown as {
        upsert: (args: {
          where: { id: string | number };
          update: RecordWithId;
          create: RecordWithId;
        }) => Prisma.PrismaPromise<RecordWithId>;
      };

      // Get only modified records with date filter
      const sourceRecords = await sourceDelegate.findMany({
        where: {
          [dateField]: {
            gte: lastSyncDate,
          },
        },
      });

      console.log(`Found ${sourceRecords.length} modified records`);

      // Sync in batches
      for (let i = 0; i < sourceRecords.length; i += this.batchSize) {
        const batch = sourceRecords.slice(i, i + this.batchSize);

        try {
          await this.targetDb.$transaction(
            batch.map((record: RecordWithId) =>
              targetDelegate.upsert({
                where: { id: record.id },
                update: record,
                create: record,
              }),
            ),
          );

          recordsSynced += batch.length;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`Batch error: ${errorMessage}`);
        }
      }

      return {
        success: errors.length === 0,
        recordsSynced,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Fatal error: ${errorMessage}`);
      return {
        success: false,
        recordsSynced,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Cleanup connections
   */
  async disconnect(): Promise<void> {
    await this.sourceDb.$disconnect();
    await this.targetDb.$disconnect();
  }
}

export {
  DatabaseSyncService,
  type SyncConfig,
  type SyncResult,
  type ModelName,
};
