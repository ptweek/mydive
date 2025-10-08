import type { Prisma } from "@prisma/client";
import type { ExtendedPrismaClient } from "../db";

export type ScheduledJump = Prisma.ScheduledJumpGetPayload<object>;

export class ScheduledJumpService {
  constructor(private db: ExtendedPrismaClient) {}

  async findAll(): Promise<ScheduledJump[]> {
    return await this.db.scheduledJump.findMany();
  }
  async findMany({
    ids,
    associatedBookingIds,
  }: {
    ids?: number[];
    associatedBookingIds?: number[];
  }): Promise<ScheduledJump[]> {
    const whereQuery = {
      ...(ids !== undefined && { id: { in: ids } }),
      ...(associatedBookingIds !== undefined && {
        associatedBookingId: { in: associatedBookingIds },
      }),
    };

    return await this.db.scheduledJump.findMany({
      where: whereQuery,
    });
  }
  async findAllByUserId(id: string): Promise<ScheduledJump[]> {
    return await this.db.scheduledJump.findMany({ where: { bookedBy: id } });
  }
  async cancelById(id: number): Promise<void> {
    await this.db.scheduledJump.update({
      where: {
        id,
      },
      data: { status: "CANCELED" },
    });
  }
  async cancelMany({ ids }: { ids: number[] }): Promise<void> {
    await this.db.scheduledJump.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: "CANCELED" },
    });
  }
  async completeById(id: number): Promise<void> {
    await this.db.scheduledJump.update({
      where: {
        id,
      },
      data: { status: "COMPLETED" },
    });
  }
}
