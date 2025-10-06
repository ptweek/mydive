import { DatabaseSyncService } from "src/lib/databaseSyncService";

// SOURCE_DATABASE_URL="" TARGET_DATA_BASE_URL= "" npx tsx src/server/scripts/syncProdclone.ts

async function main() {
  const syncService = new DatabaseSyncService({
    sourceDatabaseUrl: process.env.PROD_DB_URL!,
    targetDatabaseUrl: process.env.PRODCLONE_DB_URL!,
    batchSize: 100,
  });

  try {
    console.log("🔄 Starting database sync...\n");

    // Sync specific tables
    const results = await syncService.syncTables([
      "bookingWindow",
      "scheduledJump",
      "waitlist",
      "waitlistEntry",
    ]);

    console.log("\n✅ Sync Complete!");
    console.log("================");

    Object.entries(results).forEach(([table, result]) => {
      console.log(`\n${table}:`);
      console.log(`  Records synced: ${result.recordsSynced}`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`  Status: ${result.success ? "✅ Success" : "❌ Failed"}`);

      if (result.errors.length > 0) {
        console.log(`  Errors:`);
        result.errors.forEach((err) => console.log(`    - ${err}`));
      }
    });
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  } finally {
    await syncService.disconnect();
  }
}

await main();
