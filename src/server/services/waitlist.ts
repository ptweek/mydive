import type { Prisma, PrismaClient } from "@prisma/client";

const waitlistIncludeConfig = {
  associatedBooking: true,
  associatedScheduledJumps: true,
  entries: {},
} as const;

export class WaitlistService {
  constructor(private db: PrismaClient) {}

  async findAll(): Promise<Waitlist[]> {
    return await this.db.waitlist.findMany();
  }
  async findAllPopulated(): Promise<WaitlistWithPopulatedFields[]> {
    return await this.db.waitlist.findMany({
      include: waitlistIncludeConfig,
    });
  }

  async findByIdPopulated(
    id: number,
  ): Promise<WaitlistWithPopulatedFields | null> {
    return await this.db.waitlist.findFirst({
      where: {
        id,
      },
      include: waitlistIncludeConfig,
    });
  }
}
export type Waitlist = Prisma.WaitlistGetPayload<object>;
export type WaitlistWithPopulatedFields = Prisma.WaitlistGetPayload<{
  include: typeof waitlistIncludeConfig;
}>;
