import z from "zod";
import { protectedProcedure } from "../api/trpc";

export const cancelBookingWindow = protectedProcedure
  .input(
    z.object({
      bookingWindowId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const bookingWindow = await ctx.services.bookingWindow.findByIdPopulated(
        input.bookingWindowId,
      );
      if (!bookingWindow) {
        throw new Error("Couldn't find booking window!");
      }
      await ctx.services.bookingWindow.cancelById(bookingWindow.id);
      const waitlistIds = bookingWindow?.waitlists.map((waitlist) => {
        return waitlist.id;
      });
      const scheduledJumpIds = bookingWindow?.scheduledJumpDates.map(
        (scheduledJump) => {
          return scheduledJump.id;
        },
      );
      await ctx.services.waitlist.closeMany({
        ids: waitlistIds,
      });
      await ctx.db.waitlistEntry.updateMany({
        where: {
          waitlistId: {
            in: waitlistIds,
          },
        },
        data: { status: "CANCELED" },
      });
      await ctx.services.scheduledJump.cancelMany({ ids: scheduledJumpIds });
    } catch (error) {
      console.error("Error canceling booking window by user:", error);
      throw new Error("Failed to canceling booking window");
    }
  });
