import type { PrismaClient } from "@prisma/client";

export class WaitlistService {
  constructor(private db: PrismaClient) {}

  async findAll() {
    return await this.db.waitlist.findMany();
  }
}
