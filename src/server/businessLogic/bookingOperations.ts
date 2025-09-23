import z from "zod";
import { protectedProcedure } from "../api/trpc";
import { TRPCError } from "@trpc/server";

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

export const removeWaitlistEntry = protectedProcedure
  .input(
    z.object({
      waitlistEntryId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      console.log(`Trying to remove waitlist entry ${input.waitlistEntryId}`);
      await ctx.services.waitlistEntry.cancelEntryAndReorder(
        input.waitlistEntryId,
      );
    } catch (error) {
      console.error("Error cancelling waitlist entry and reordering:", error);
      throw new Error("Failed to cancel waitlist entry");
    }
  });

export const cancelScheduledJump = protectedProcedure
  .input(
    z.object({
      scheduledJumpId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { scheduledJumpId } = input;

    return await ctx.db.$transaction(async (tx) => {
      // 1. Find the scheduled jump to cancel
      const scheduledJump = await tx.scheduledJump.findUnique({
        where: { id: scheduledJumpId },
        include: {
          associatedBooking: true,
          associatedWaitlist: true,
        },
      });

      if (!scheduledJump) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scheduled jump not found",
        });
      }

      // 2. Cancel the scheduled jump
      await tx.scheduledJump.update({
        where: { id: scheduledJumpId },
        data: {
          status: "CANCELED",
          updatedAt: new Date(),
        },
      });

      // 3. Handle waitlist logic based on scheduling method
      if (scheduledJump.schedulingMethod === "BOOKING_WINDOW") {
        // If this was from a booking window, check if there's a closed waitlist for this day
        const waitlistForDay = await tx.waitlist.findFirst({
          where: {
            day: scheduledJump.jumpDate,
            status: "CLOSED", // Only reopen if it was closed
          },
        });

        if (waitlistForDay) {
          await tx.waitlist.update({
            where: { id: waitlistForDay.id },
            data: {
              status: "OPENED",
            },
          });
        }
      } else if (scheduledJump.schedulingMethod === "WAITLIST") {
        // If this was from a waitlist, reopen that specific waitlist
        if (scheduledJump.associatedWaitlistId) {
          await tx.waitlist.update({
            where: { id: scheduledJump.associatedWaitlistId },
            data: {
              status: "OPENED",
            },
          });
        }
      }

      // 4. Check if we need to update the booking window status
      // If there are no more confirmed jumps for this booking, set it back to PENDING
      const remainingConfirmedJumps = await tx.scheduledJump.count({
        where: {
          associatedBookingId: scheduledJump.associatedBookingId,
          status: "CONFIRMED",
          id: { not: scheduledJumpId },
        },
      });

      if (remainingConfirmedJumps === 0) {
        await tx.bookingWindow.update({
          where: { id: scheduledJump.associatedBookingId },
          data: {
            status: "PENDING",
            updatedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        message: "Jump canceled successfully",
        canceledJumpId: scheduledJumpId,
        waitlistReopened:
          scheduledJump.schedulingMethod === "WAITLIST"
            ? scheduledJump.associatedWaitlistId
            : null,
      };
    });
  });
