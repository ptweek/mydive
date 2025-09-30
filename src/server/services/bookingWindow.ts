import { BookingStatus, type Prisma, type PrismaClient } from "@prisma/client";
import type { Logger } from "pino";

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
  async findOne({
    id,
    bookedBy,
    status,
  }: {
    id?: number;
    bookedBy?: string;
    status?: BookingStatus;
  }): Promise<BookingWindow | null> {
    const whereQuery = {
      ...(id !== undefined && { id }),
      ...(bookedBy !== undefined && { bookedBy }),
      ...(status !== undefined && { status }),
    };
    if (Object.keys(whereQuery).length === 0) {
      throw new Error("At least one search parameter must be provided");
    }
    return await this.db.bookingWindow.findFirst({
      where: whereQuery,
    });
  }
  async findMany({ ids }: { ids: number[] }): Promise<BookingWindow[]> {
    return await this.db.bookingWindow.findMany({ where: { id: { in: ids } } });
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
  async updateDepositInfoFromStripeCheckout(
    id: number,
    log: Logger,
  ): Promise<BookingWindow> {
    log.info({ bookingWindowId: id }, "Updating booking window");
    try {
      const updated = await this.db.bookingWindow.update({
        where: { id },
        data: {
          status: BookingStatus.UNSCHEDULED,
          depositPaid: true,
          depositConfirmedAt: new Date(),
        },
      });

      log.info({ bookingWindowId: id }, "Booking window updated");
      return updated;
    } catch (error) {
      log.error(
        {
          bookingWindowId: id,
          error: error instanceof Error ? error.message : String(error),
        },
        "Failed to update booking window",
      );
      throw error;
    }
  }
}
