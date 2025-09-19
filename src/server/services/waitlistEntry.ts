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
}
export type Waitlist = Prisma.WaitlistGetPayload<object>;
export type WaitlistEntryWithPopulatedFields = Prisma.WaitlistEntryGetPayload<{
  include: typeof waitlistEntryIncludeConfig;
}>;
