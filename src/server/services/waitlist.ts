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
  async findById(id: number): Promise<Waitlist | null> {
    return await this.db.waitlist.findFirst({
      where: {
        id,
      },
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
  async closeById(id: number): Promise<void> {
    await this.db.waitlist.update({
      where: {
        id,
      },
      data: { status: "CLOSED" },
    });
  }
  async closeMany({ ids }: { ids: number[] }): Promise<void> {
    await this.db.waitlist.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: "CLOSED",
      },
    });
  }
}

export type Waitlist = Prisma.WaitlistGetPayload<object>;
export type WaitlistWithPopulatedFields = Prisma.WaitlistGetPayload<{
  include: typeof waitlistIncludeConfig;
}>;
