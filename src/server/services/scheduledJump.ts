import type { Prisma, PrismaClient } from "@prisma/client";

export type ScheduledJump = Prisma.ScheduledJumpGetPayload<object>;

export class ScheduledJumpService {
  constructor(private db: PrismaClient) {}

  async findAll(): Promise<ScheduledJump[]> {
    return await this.db.scheduledJump.findMany();
  }
  async findAllByUserId(id: string): Promise<ScheduledJump[]> {
    return await this.db.scheduledJump.findMany({ where: { bookedBy: id } });
  }
  async cancelMany({ ids }: { ids: number[] }): Promise<void> {
    await this.db.scheduledJump.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: "CANCELED" },
    });
  }
}
