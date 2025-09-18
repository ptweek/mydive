import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import z from "zod";

export const customerBookingManager = createTRPCRouter({
  getBookingRequestsByUser: protectedProcedure
    .input(
      z.object({
        bookedBy: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const bookingWindows =
          await ctx.services.bookingWindow.findAllByUserPopulated(
            input.bookedBy,
          );
        return { bookingWindows };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
      }
    }),
});
