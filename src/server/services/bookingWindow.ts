import type { Prisma, PrismaClient } from "@prisma/client";

const bookWindowIncludeConfig = {
  scheduledJumpDates: {
    orderBy: {
      jumpDate: "asc" as const,
    },
  },
  waitlists: {
    include: {
      entries: true,
    },
  },
} as const;

export type BookingWindow = Prisma.BookingWindowGetPayload<object>;
export type BookingWindowWithPopulatedFields = Prisma.BookingWindowGetPayload<{
  include: typeof bookWindowIncludeConfig;
}>;

export class BookingWindowService {
  constructor(private db: PrismaClient) {}

  async findAll(): Promise<BookingWindow[]> {
    return await this.db.bookingWindow.findMany();
  }
  async findAllPopulated(): Promise<BookingWindowWithPopulatedFields[]> {
    return await this.db.bookingWindow.findMany({
      include: bookWindowIncludeConfig,
    });
  }
  async findAllByUser(id: string): Promise<BookingWindow[]> {
    return await this.db.bookingWindow.findMany({
      where: {
        bookedBy: id,
      },
    });
  }
  async findAllByUserPopulated(
    id: string,
  ): Promise<BookingWindowWithPopulatedFields[]> {
    return await this.db.bookingWindow.findMany({
      where: {
        bookedBy: id,
      },
      include: bookWindowIncludeConfig,
    });
  }
}
