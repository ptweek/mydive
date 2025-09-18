import type { Prisma, PrismaClient } from "@prisma/client";

export type ScheduledJump = Prisma.ScheduledJumpGetPayload<object>;

export class ScheduledJumpService {
  constructor(private db: PrismaClient) {}

  async findAll(): Promise<ScheduledJump[]> {
    return await this.db.scheduledJump.findMany();
  }
}
