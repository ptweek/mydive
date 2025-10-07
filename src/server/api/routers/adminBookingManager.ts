import { clerkClient, type User } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import {
  cancelBookingWindow,
  cancelScheduledJump,
  cancelWaitlistEntry,
} from "mydive/server/businessLogic/bookingOperations";
import z from "zod";
import { createLogger } from "mydive/lib/logger";

type UserDto = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string[];
  phoneNumbers: string[];
};

export const clerkUserToDto = (user: User): UserDto => {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses.map((email) => {
      return email.emailAddress;
    }),
    userId: user.id,
    phoneNumbers: user.phoneNumbers.map((phoneNumber) => {
      return phoneNumber.phoneNumber;
    }),
  };
};

const log = createLogger("admin-booking-manager");

// We should create a very specific admin checking procedure!
export const adminBookingManagerRouter = createTRPCRouter({
  // In the future, I should only fetch this information a single time per month, and cache previous months.
  getBookingReservationData: protectedProcedure.query(async ({ ctx }) => {
    const client = await clerkClient();
    const bookingWindows = await ctx.services.bookingWindow.findAllPopulated();
    const waitlists = await ctx.services.waitlist.findAllPopulated();
    const scheduledJumps = await ctx.services.scheduledJump.findAll();

    // Collect user IDs from BOTH booking windows AND waitlist entries
    const bookingUserIds = bookingWindows.map((b) => b.bookedBy);
    const waitlistUserIds = waitlists.flatMap((waitlist) =>
      waitlist.entries.map((entry) => entry.waitlistedUserId),
    );

    // Combine and deduplicate all user IDs
    const allUserIds = [...new Set([...bookingUserIds, ...waitlistUserIds])];

    // Fetch all users at once
    const users = (await client.users.getUserList({ userId: allUserIds })).data;
    const userData = users.map((user) => {
      return clerkUserToDto(user);
    });

    return { bookingWindows, waitlists, scheduledJumps, users: userData };
  }),
  modifyBookingDates: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        bookedBy: z.string(),
        confirmedBy: z.string(), // Admin who is confirming
        confirmedDates: z.array(z.string().datetime()), // ISO date strings
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First, verify the booking exists and belongs to the user
        const existingBooking = await ctx.db.bookingWindow.findFirst({
          where: {
            id: input.bookingId,
            bookedBy: input.bookedBy,
          },
          include: {
            scheduledJumpDates: true, // Include existing scheduled jumps
          },
        });

        if (!existingBooking) {
          throw new Error(
            "Booking not found or you don't have permission to modify it",
          );
        }

        // Validate that the booking is in a state that can be confirmed
        if (existingBooking.status === "CANCELED") {
          throw new Error("Cannot confirm dates for a canceled booking");
        }

        // Convert date strings to Date objects for validation
        const confirmedDates = input.confirmedDates.map(
          (dateStr) => new Date(dateStr),
        );

        // Validate that all confirmed dates are within the booking window
        const windowStart = new Date(existingBooking.windowStartDate);
        const windowEnd = new Date(existingBooking.windowEndDate);

        for (const date of confirmedDates) {
          if (date < windowStart || date > windowEnd) {
            throw new Error(
              `All confirmed dates must be within the booking window (${windowStart.toDateString()} - ${windowEnd.toDateString()})`,
            );
          }
        }

        // Remove duplicate dates and sort them
        const uniqueDateStrings = [...new Set(input.confirmedDates)].sort();

        // Get existing scheduled jumps for this booking
        const existingScheduledJumps =
          existingBooking.scheduledJumpDates.filter((scheduledJumpDate) => {
            return scheduledJumpDate.status !== "CANCELED";
          });

        // Convert confirmed dates to ISO strings for comparison
        const confirmedDateISOStrings = uniqueDateStrings.map((dateStr) =>
          new Date(dateStr).toISOString(),
        );

        // Two types of jumps to cancel, one is a jump that is now being removed by the admin, or another is a booking window jump
        // Overwriting a waitlist jump
        const bwJumpsRemovedByAdmin = existingScheduledJumps.filter(
          (jump) =>
            !confirmedDateISOStrings.includes(jump.jumpDate.toISOString()) &&
            jump.schedulingMethod === "BOOKING_WINDOW",
        );
        const wlJumpsOverwrittenByAdmin = existingScheduledJumps.filter(
          (jump) =>
            confirmedDateISOStrings.includes(jump.jumpDate.toISOString()) &&
            jump.schedulingMethod === "WAITLIST",
        );
        const jumpsToCancel = [
          ...bwJumpsRemovedByAdmin,
          ...wlJumpsOverwrittenByAdmin,
        ];

        console.log("=== BOOKING MODIFICATION DEBUG ===");
        console.log("Booking ID:", input.bookingId);
        console.log("BW Jumps Removed:", bwJumpsRemovedByAdmin.length);
        console.log("WL Jumps Overwritten:", wlJumpsOverwrittenByAdmin.length);

        // Find dates that need new scheduled jumps (not already existing)
        const existingJumpDateStrings = existingScheduledJumps.map((jump) =>
          jump.jumpDate.toISOString(),
        );

        const datesForNewScheduledJumps = [
          ...uniqueDateStrings.filter(
            (dateStr) =>
              !existingJumpDateStrings.includes(
                new Date(dateStr).toISOString(),
              ),
          ), // Adding in any new ones that haven't existed yet.
          ...wlJumpsOverwrittenByAdmin.map((jump) => {
            return jump.jumpDate.toISOString();
          }),
        ];

        console.log(
          "New Scheduled Jumps to Create:",
          datesForNewScheduledJumps.length,
        );

        const datesModifiedByAdmin = new Set([
          ...confirmedDateISOStrings,
          ...jumpsToCancel.map((jump) => {
            return jump.jumpDate.toISOString();
          }),
        ]);

        console.log(
          "Total Dates Modified by Admin:",
          datesModifiedByAdmin.size,
        );

        // Use a transaction to ensure all operations succeed or fail together
        const result = await ctx.db.$transaction(async (tx) => {
          // 1. Cancel existing scheduled jumps that are not in the confirmed dates
          const canceledJumpIds = jumpsToCancel.map((jump) => {
            return jump.id;
          });
          const canceledJumps = await tx.scheduledJump.updateMany({
            where: { id: { in: canceledJumpIds } },
            data: { status: "CANCELED" },
          });

          console.log("Canceled Jumps:", canceledJumps.count);

          // 2. Get all waitlists affected by admin modification
          const waitlistQueryDates = [...datesModifiedByAdmin].map(
            (dateIsoStr) => {
              const jumpDateStart = new Date(dateIsoStr);
              jumpDateStart.setHours(0, 0, 0, 0);
              return jumpDateStart;
            },
          );

          console.log("=== WAITLIST QUERY ===");
          console.log("Query Dates (count):", waitlistQueryDates.length);
          console.log(
            "Query Dates (ISO):",
            waitlistQueryDates.map((d) => d.toISOString()),
          );

          const waitlistsAffectedByModification = await tx.waitlist.findMany({
            where: {
              day: {
                in: waitlistQueryDates,
              },
            },
          });

          console.log(
            "Waitlists Found:",
            waitlistsAffectedByModification.length,
          );
          console.log(
            "Waitlist Days (ISO):",
            waitlistsAffectedByModification.map((w) => ({
              id: w.id,
              day: w.day.toISOString(),
              status: w.status,
            })),
          );

          // 3. Reopen waitlists for Booking Window jumps that were cancelled
          console.log("=== WAITLIST REOPENING ===");
          console.log("BW Jumps to Process:", bwJumpsRemovedByAdmin.length);

          const waitlistIdsForReopening = bwJumpsRemovedByAdmin
            .map((jump) => {
              const jumpDateStart = new Date(jump.jumpDate);
              jumpDateStart.setHours(0, 0, 0, 0);

              console.log(
                `Looking for waitlist - Jump Date: ${jump.jumpDate.toISOString()}, Normalized: ${jumpDateStart.toISOString()}, Timestamp: ${jumpDateStart.getTime()}`,
              );

              const waitlistForReopening = waitlistsAffectedByModification.find(
                (waitlist) => {
                  const match =
                    waitlist.day.getTime() === jumpDateStart.getTime();
                  console.log(
                    `  Comparing with waitlist ${waitlist.id}: ${waitlist.day.toISOString()} (${waitlist.day.getTime()}) - Match: ${match}`,
                  );
                  return match;
                },
              );

              console.log(
                `  Result: ${waitlistForReopening ? `Found ID ${waitlistForReopening.id}` : "NOT FOUND"}`,
              );
              return waitlistForReopening?.id;
            })
            .filter((id) => id !== undefined);

          console.log("Waitlist IDs for Reopening:", waitlistIdsForReopening);

          const waitlistUpdatesForCanceled = await tx.waitlist.updateMany({
            where: { id: { in: waitlistIdsForReopening } },
            data: { status: "OPEN" },
          });

          console.log("Waitlists Reopened:", waitlistUpdatesForCanceled.count);

          // 4. Create new ScheduledJump records for dates that don't already exist
          const newScheduledJumps = await Promise.all(
            datesForNewScheduledJumps.map(async (dateStr) => {
              return tx.scheduledJump.create({
                data: {
                  jumpDate: new Date(dateStr),
                  bookingZone: existingBooking.bookingZone,
                  numJumpers: existingBooking.numJumpers,
                  associatedBookingId: input.bookingId,
                  bookedBy: input.bookedBy,
                  confirmedBy: input.confirmedBy,
                  status: "SCHEDULED",
                  schedulingMethod: "BOOKING_WINDOW",
                },
              });
            }),
          );

          console.log("New Scheduled Jumps Created:", newScheduledJumps.length);

          // 5. Handle waitlist status for new jump dates
          console.log("=== WAITLIST CLOSING ===");
          console.log("Dates for New Jumps:", datesForNewScheduledJumps.length);

          const waitlistIdsForClosing = datesForNewScheduledJumps
            .map((date) => {
              const jumpDateStart = new Date(date);
              jumpDateStart.setHours(0, 0, 0, 0);

              console.log(
                `Looking for waitlist to close - Date: ${date}, Normalized: ${jumpDateStart.toISOString()}, Timestamp: ${jumpDateStart.getTime()}`,
              );

              const waitlistToBeClosed = waitlistsAffectedByModification.find(
                (wl) => {
                  const match = wl.day.getTime() === jumpDateStart.getTime();
                  console.log(
                    `  Comparing with waitlist ${wl.id}: ${wl.day.toISOString()} (${wl.day.getTime()}) - Match: ${match}`,
                  );
                  return match;
                },
              );

              console.log(
                `  Result: ${waitlistToBeClosed ? `Found ID ${waitlistToBeClosed.id}` : "NOT FOUND"}`,
              );
              return waitlistToBeClosed?.id;
            })
            .filter((id) => id !== undefined);

          console.log("Waitlist IDs for Closing:", waitlistIdsForClosing);

          const waitlistUpdatesForNew = await tx.waitlist.updateMany({
            where: { id: { in: waitlistIdsForClosing } },
            data: { status: "CLOSED" },
          });

          console.log("Waitlists Closed:", waitlistUpdatesForNew.count);

          // 6. Update the booking status to SCHEDULED (if it has any confirmed dates)
          const updatedBooking = await tx.bookingWindow.update({
            where: {
              id: input.bookingId,
              bookedBy: input.bookedBy,
            },
            data: {
              status:
                uniqueDateStrings.length > 0 ? "SCHEDULED" : "UNSCHEDULED",
            },
            include: {
              scheduledJumpDates: true,
            },
          });

          return {
            updatedBooking,
            newScheduledJumps,
            canceledJumps,
            waitlistUpdatesForCanceled,
            waitlistUpdatesForNew,
          };
        });

        // Count confirmed (non-canceled) scheduled jumps
        const confirmedScheduledJumps =
          result.updatedBooking.scheduledJumpDates.filter((jump) => {
            return jump.status === "SCHEDULED";
          });

        console.log("=== FINAL SUMMARY ===");
        console.log("Total Confirmed Jumps:", confirmedScheduledJumps.length);
        console.log(
          "Waitlists Reopened:",
          result.waitlistUpdatesForCanceled.count,
        );
        console.log("Waitlists Closed:", result.waitlistUpdatesForNew.count);
        console.log("=== END DEBUG ===");

        return {
          success: true,
          booking: result.updatedBooking,
          newScheduledJumps: result.newScheduledJumps,
          canceledJumps: result.canceledJumps,
          newDatesCount: datesForNewScheduledJumps.length,
          canceledDatesCount: result.canceledJumps.count,
          totalConfirmedJumps: confirmedScheduledJumps.length,
          waitlistUpdates: {
            reopened: result.waitlistUpdatesForCanceled.count,
            closed: result.waitlistUpdatesForNew.count,
          },
          summary: {
            created: result.newScheduledJumps.length,
            canceled: result.canceledJumps.count,
            totalConfirmed: confirmedScheduledJumps.length,
            waitlistsReopened: result.waitlistUpdatesForCanceled.count,
            waitlistsClosed: result.waitlistUpdatesForNew.count,
          },
        };
      } catch (error) {
        console.error("Error modifying booking dates:", error);

        // Re-throw known errors, wrap unknown ones
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Failed to modify booking dates");
      }
    }),
  scheduleJumpDateFromWaitlistEntry: protectedProcedure
    .input(
      z.object({
        waitlistId: z.number(),
        waitlistEntryId: z.number(),
        bookerId: z.string(), // should be someone from the waitlist entry
        confirmedBy: z.string(), // admin
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // find the waistlist that is associated with the day
      // create a scheduled jump for that day, associated with booking id and waitlist
      // close the waitlist and associate with new scheduled jump
      try {
        const waitlist = await ctx.services.waitlist.findByIdPopulated(
          input.waitlistId,
        );
        const existingBooking = waitlist?.associatedBooking;
        if (!existingBooking) {
          throw new Error("Existing booking not found for waitlist!");
        }
        const waitlistDate = waitlist?.day;
        await ctx.db.scheduledJump.create({
          data: {
            jumpDate: waitlistDate,
            bookingZone: existingBooking.bookingZone,
            numJumpers: existingBooking.numJumpers,
            associatedBookingId: existingBooking.id,
            associatedWaitlistId: waitlist.id,
            bookedBy: input.bookerId,
            confirmedBy: input.confirmedBy,
            status: "SCHEDULED",
            schedulingMethod: "WAITLIST",
          },
        });
        await ctx.db.waitlistEntry.update({
          where: { id: input.waitlistEntryId },
          data: {
            status: "SCHEDULED",
          },
        });
        await ctx.db.waitlist.update({
          where: { id: waitlist.id },
          data: {
            status: "CONFIRMED",
          },
        });
      } catch (error) {
        console.error("Error confirming waitlist as a scheduled jummp:", error);

        // Re-throw known errors, wrap unknown ones
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Failed to confirm waitlist as a scheduled jump date");
      }
    }),
  cancelScheduledJump,
  cancelBookingWindow,
  cancelWaitlistEntry,
});
