import type { Prisma, PrismaClient } from "@prisma/client";

const bookingWindowIncludeConfig = {
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
  include: typeof bookingWindowIncludeConfig;
}>;

export class BookingWindowService {
  constructor(private db: PrismaClient) {}

  async findAll(): Promise<BookingWindow[]> {
    return await this.db.bookingWindow.findMany();
  }
  async findAllPopulated(): Promise<BookingWindowWithPopulatedFields[]> {
    return await this.db.bookingWindow.findMany({
      include: bookingWindowIncludeConfig,
    });
  }
  async findById(id: number): Promise<BookingWindow | null> {
    return await this.db.bookingWindow.findUnique({
      where: {
        id,
      },
    });
  }
  async findByIdPopulated(
    id: number,
  ): Promise<BookingWindowWithPopulatedFields | null> {
    return await this.db.bookingWindow.findUnique({
      where: {
        id,
      },
      include: bookingWindowIncludeConfig,
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
      include: bookingWindowIncludeConfig,
    });
  }

  async cancelById(id: number): Promise<void> {
    await this.db.bookingWindow.update({
      where: {
        id,
      },
      data: {
        status: "CANCELED",
      },
    });
  }
}
