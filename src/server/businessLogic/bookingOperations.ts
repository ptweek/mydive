import z from "zod";
import { protectedProcedure } from "../api/trpc";
import { TRPCError } from "@trpc/server";
import {
  BookingStatus,
  BookingZone,
  WaitlistEntryStatus,
} from "@prisma/client";

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

/*
Handles two circumstances for cancelling a waitlist entry.
1. Where the waitlist entry is just a normal entry on the waitlist, waiting 
to be scheduled by the admin (status === "WAITING")
2. Where the waitlist entry has been scheduled and is the scheduled jump associated with
the waitlist.
*/

export const cancelWaitlistEntry = protectedProcedure
  .input(
    z.object({
      waitlistEntryId: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const waitlistEntry = await ctx.services.waitlistEntry.findByIdPopulated(
        input.waitlistEntryId,
      );
      if (!waitlistEntry) {
        throw new Error("Failed to find waitlist entry");
      }
      const waitlist = await ctx.services.waitlist.findByIdPopulated(
        waitlistEntry.waitlistId,
      );
      if (!waitlist) {
        throw new Error(
          "Could not find populated waitlist for the waitlist id associated with the waitlist entry",
        );
      }
      /* 
        logic to cancel the scheduled jump and reopen the waitlist 
        if the waitlist entry is currently the scheduled jump from the
        waitlist.
      */
      if (waitlistEntry?.status === WaitlistEntryStatus.SCHEDULED) {
        const scheduledJump = waitlist?.associatedScheduledJumps.find(
          (scheduledJump) => {
            return scheduledJump.status === "SCHEDULED";
          },
        );
        if (!scheduledJump) {
          throw new Error(
            "Could not find appropriate scheduled jump for scheduled waitlist entry",
          );
        }
        if (scheduledJump.bookedBy !== waitlistEntry.waitlistedUserId) {
          throw new Error(
            "The user for the waitlist entry and the scheduled jump do not match",
          );
        }
        await ctx.services.scheduledJump.cancelById(scheduledJump.id);
        await ctx.services.waitlist.openById(waitlist.id);
      }
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

    // 1. Find and validate the scheduled jump (outside transaction)
    const scheduledJump = await ctx.db.scheduledJump.findUnique({
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

    // 2. Validate waitlist scheduling method requirements
    if (scheduledJump.schedulingMethod === "WAITLIST") {
      if (!scheduledJump.associatedWaitlistId) {
        throw new Error(
          "Scheduling method was from waitlist, but there is no associated waitlist on scheduledJump",
        );
      }

      const waitlist = await ctx.services.waitlist.findByIdPopulated(
        scheduledJump.associatedWaitlistId,
      );

      if (!waitlist) {
        throw new Error(
          `Could not find waitlist for ${scheduledJump.associatedWaitlistId}`,
        );
      }

      const scheduledWaitlistEntry = waitlist.entries.find(
        (entry) =>
          entry.status === "SCHEDULED" &&
          entry.waitlistedUserId === scheduledJump.bookedBy,
      );

      if (!scheduledWaitlistEntry) {
        throw new Error(
          "Problem finding the associated waitlist entry for the jump day!",
        );
      }

      // Cancel the waitlist entry (this likely has its own logic/transaction)
      await ctx.services.waitlistEntry.cancelEntryAndReorder(
        scheduledWaitlistEntry.id,
      );
    }

    // 3. Now do the simple database updates in a focused transaction
    await ctx.db.$transaction(async (tx) => {
      // Cancel the scheduled jump
      await tx.scheduledJump.update({
        where: { id: scheduledJumpId },
        data: {
          status: "CANCELED",
          updatedAt: new Date(),
        },
      });

      // Handle waitlist reopening
      if (scheduledJump.schedulingMethod === "BOOKING_WINDOW") {
        const waitlistForDay = await tx.waitlist.findFirst({
          where: {
            day: scheduledJump.jumpDate,
            status: "CLOSED",
          },
        });

        if (waitlistForDay) {
          await tx.waitlist.update({
            where: { id: waitlistForDay.id },
            data: { status: "OPEN" },
          });
        }
      } else if (scheduledJump.schedulingMethod === "WAITLIST") {
        await tx.waitlist.update({
          where: { id: scheduledJump.associatedWaitlistId! },
          data: { status: "OPEN" },
        });
      }

      // Update booking window status if needed
      const remainingConfirmedJumps = await tx.scheduledJump.count({
        where: {
          associatedBookingId: scheduledJump.associatedBookingId,
          status: "SCHEDULED",
          id: { not: scheduledJumpId },
        },
      });

      if (remainingConfirmedJumps === 0) {
        await tx.bookingWindow.update({
          where: { id: scheduledJump.associatedBookingId },
          data: {
            status: "UNSCHEDULED",
            updatedAt: new Date(),
          },
        });
      }
    });

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

export const createBookingWindow = protectedProcedure
  .input(
    z.object({
      numJumpers: z.number().min(1).max(10), // adjust max as needed
      windowStartDate: z.date(),
      windowEndDate: z.date(),
      idealizedJumpDay: z.date(),
      createdById: z.string(),
      bookingZone: z.nativeEnum(BookingZone),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { windowStartDate, windowEndDate, idealizedJumpDay } = input;
    // Validate that windowEndDate is after windowStartDay
    if (windowEndDate <= windowStartDate) {
      throw new Error("Window end date must be after start date");
    }

    // Validate that idealizedJumpDay is within the window
    if (
      idealizedJumpDay < windowStartDate ||
      idealizedJumpDay > windowEndDate
    ) {
      throw new Error("Idealized jump day must be within the booking window");
    }

    try {
      const existingBookingWindows = await ctx.db.bookingWindow.findMany({
        where: {
          status: {
            notIn: [BookingStatus.PENDING_DEPOSIT, BookingStatus.CANCELED],
          },
          AND: [
            {
              windowStartDate: {
                lte: windowEndDate, // booking starts before or when the range ends
              },
            },
            {
              windowEndDate: {
                gte: windowStartDate, // booking ends after or when the range starts
              },
            },
          ],
        },
      });
      if (existingBookingWindows.length > 0) {
        throw new Error(
          "Booking window overlaps with existing booking window!",
        );
      }
      const newBooking = await ctx.db.bookingWindow.create({
        data: {
          bookingZone: input.bookingZone,
          numJumpers: input.numJumpers,
          windowStartDate: input.windowStartDate,
          windowEndDate: input.windowEndDate,
          idealizedJumpDate: input.idealizedJumpDay,
          bookedBy: input.createdById,
          status: "PENDING_DEPOSIT", // new field
        },
      });

      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking");
    }
  });
