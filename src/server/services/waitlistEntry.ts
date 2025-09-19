import type { Prisma, PrismaClient } from "@prisma/client";

const waitlistEntryIncludeConfig = {
  waitlist: true,
} as const;

export class WaitlistEntryService {
  constructor(private db: PrismaClient) {}

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
          status: "CANCELED",
        },
      });
      await tx.waitlistEntry.updateMany({
        where: {
          waitlistId: entryToRemove.waitlistId,
          position: { gt: entryToRemove.position },
        },
        data: {
          position: { decrement: 1 },
        },
      });

      return { removedPosition: entryToRemove.position };
    });
  }
}
export type Waitlist = Prisma.WaitlistGetPayload<object>;
export type WaitlistEntryWithPopulatedFields = Prisma.WaitlistEntryGetPayload<{
  include: typeof waitlistEntryIncludeConfig;
}>;
