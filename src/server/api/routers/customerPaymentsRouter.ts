import { BookingStatus } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import z from "zod";

export const customerPaymentsRouter = createTRPCRouter({
  getUnpaidBookingWindowByIdAndUser: protectedProcedure
    .input(
      z.object({
        bookedBy: z.string(),
        bookingWindowId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const bookingWindow = await ctx.services.bookingWindow.findOne({
          bookedBy: input.bookedBy,
          id: input.bookingWindowId,
          status: BookingStatus.PENDING_DEPOSIT,
        });
        return { bookingWindow };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
      }
    }),
});
