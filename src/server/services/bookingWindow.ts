import { BookingStatus, type Prisma } from "@prisma/client";
import type { Logger } from "pino";
import type { ExtendedPrismaClient } from "../db";

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
  constructor(private db: ExtendedPrismaClient) {}

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
  async confirmBookingWindowFromStripeCheckout(
    id: number,
    log: Logger,
  ): Promise<BookingWindow> {
    log.info(
      { bookingWindowId: id },
      "Received checkout completion event from stripe. Beginning confirmation of booking window.",
    );
    try {
      /* 
        whenever I schedule a booking date, I need to look at
      */
      log.info({ bookingWindowId: id }, "Booking window confirmed");
      const bookingWindow = await this.db.bookingWindow.findFirst({
        where: { id },
      });
      if (!bookingWindow) {
        throw new Error(`Booking window not found for ${id}`);
      }
      /*
        Constraints
        1. Booking window cannot have overlap with any other confirmed booking window, and if it does, fail the process.
        2. Any *pending_deposit* booking windows that have ANY overlap with the booking window will be canceled.
      */
      const existingBookingWindows = await this.db.bookingWindow.findMany({
        where: {
          status: {
            notIn: [BookingStatus.PENDING_DEPOSIT, BookingStatus.CANCELED],
          },
          AND: [
            {
              windowStartDate: {
                lte: bookingWindow.windowEndDate, // booking starts before or when the range ends
              },
            },
            {
              windowEndDate: {
                gte: bookingWindow.windowStartDate, // booking ends after or when the range starts
              },
            },
          ],
        },
      });
      if (existingBookingWindows.length > 0) {
        log.info(
          { bookingWindowId: id },
          `Booking window ${id}overlaps with existing booking window, and therefore cannot be confirmed`,
        );
        throw new Error(
          "Booking window overlaps with existing booking window!",
        );
      }
      /* update booking window to confirmed */
      const updated = await this.db.bookingWindow.update({
        where: { id },
        data: {
          status: BookingStatus.UNSCHEDULED,
          depositPaid: true,
          depositPaidAt: new Date(),
        },
      });

      /* cancel any pending booking windows */
      await this.db.bookingWindow.updateMany({
        where: {
          status: BookingStatus.PENDING_DEPOSIT,
          AND: [
            {
              windowStartDate: {
                lte: bookingWindow.windowEndDate, // booking starts before or when the range ends
              },
            },
            {
              windowEndDate: {
                gte: bookingWindow.windowStartDate, // booking ends after or when the range starts
              },
            },
          ],
        },
        data: {
          status: BookingStatus.CANCELED,
          cancellationReason: "Overlapping w/ confirmed booking window",
        },
      });
      log.info({ bookingWindowId: id }, "Booking window confirmed");
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
