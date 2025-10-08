import { BookingStatus, type Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "mydive/server/api/trpc";
import { createBookingWindow } from "mydive/server/businessLogic/bookingOperations";
import z from "zod";

export const bookingWindowRouter = createTRPCRouter({
  getBookings: publicProcedure
    .input(
      z.object({
        status: z
          .object({
            notIn: z.array(z.nativeEnum(BookingStatus)),
          })
          .optional(),
        windowStartDate: z
          .object({
            gte: z.date(),
            lt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause: Prisma.BookingWindowWhereInput = {
        ...(input?.status && { status: { notIn: input.status.notIn } }),
        ...(input?.windowStartDate && {
          windowStartDate: {
            gte: input.windowStartDate.gte,
            lt: input.windowStartDate.lt,
          },
        }),
      };
      const includeConfig = {
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

      const bookings = await ctx.db.bookingWindow.findMany({
        where: whereClause,
        include: includeConfig,
      });

      return { bookings };
    }),
  cancelBooking: protectedProcedure
    .input(
      z.object({
        bookedBy: z.string(),
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedBooking = await ctx.db.bookingWindow.update({
          data: {
            status: "CANCELED",
          },
          where: {
            bookedBy: input.bookedBy,
            id: input.id,
          },
        });

        return { success: true, booking: updatedBooking };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
      }
    }),
  createBookingWindow,
});
