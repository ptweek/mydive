import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import z from "zod";

export const customerBookingManagerRouter = createTRPCRouter({
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
        const waitlistEntries =
          await ctx.services.waitlistEntry.findAllByUserPopulated(
            input.bookedBy,
          );
        return { bookingWindows, waitlistEntries };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
      }
    }),
});
