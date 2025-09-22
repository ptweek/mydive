import type { Prisma, PrismaClient } from "@prisma/client";

const waitlistEntryIncludeConfig = {
  waitlist: true,
} as const;

export class WaitlistEntryService {
  constructor(private db: PrismaClient) {}

  async findManyByWaitlistId(waitlistId: number): Promise<WaitlistEntry[]> {
    return await this.db.waitlistEntry.findMany({
      where: {
        waitlistId,
      },
      include: waitlistEntryIncludeConfig,
    });
  }
  async findManyByWaitlistIdPopulated(
    waitlistId: number,
  ): Promise<WaitlistEntryWithPopulatedFields[]> {
    return await this.db.waitlistEntry.findMany({
      where: {
        waitlistId,
      },
      include: waitlistEntryIncludeConfig,
    });
  }
  async findAllByUserPopulated(
    id: string,
  ): Promise<WaitlistEntryWithPopulatedFields[]> {
    return await this.db.waitlistEntry.findMany({
      where: {
        waitlistedUserId: id,
      },
      include: waitlistEntryIncludeConfig,
    });
  }
  async cancelEntryAndReorder(id: number) {
    return await this.db.$transaction(async (tx) => {
      const entryToRemove = await tx.waitlistEntry.findUniqueOrThrow({
        where: { id },
      });
      await tx.waitlistEntry.update({
        where: { id },
        data: {
          activePosition: null,
          status: "CANCELED",
        },
      });
      // Only decrement entries that were positioned AFTER the removed entry
      // Skip reordering if the entry was already canceled (activePosition is null)
      if (entryToRemove.activePosition !== null) {
        await tx.waitlistEntry.updateMany({
          where: {
            waitlistId: entryToRemove.waitlistId,
            activePosition: { gt: entryToRemove.activePosition },
            status: { not: "CANCELED" },
          },
          data: {
            activePosition: { decrement: 1 },
            latestPosition: { decrement: 1 },
          },
        });
      }

      return { removedPosition: entryToRemove.latestPosition };
    });
  }
}
export type WaitlistEntry = Prisma.WaitlistEntryGetPayload<object>;
export type WaitlistEntryWithPopulatedFields = Prisma.WaitlistEntryGetPayload<{
  include: typeof waitlistEntryIncludeConfig;
}>;
