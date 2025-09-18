import { clerkClient, type User } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import z from "zod";

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

// We should create a very specific admin checking procedure!
export const adminBookingManagerRouter = createTRPCRouter({
  // In the future, I should only fetch this information a single time per month, and cache previous months.
  getBookingReservationData: protectedProcedure.query(async ({ ctx }) => {
    const client = await clerkClient();
    const bookingWindows = await ctx.services.bookingWindow.findAll();
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
            !confirmedDateISOStrings.includes(jump.jumpDate.toISOString()),
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

        // Use a transaction to ensure all operations succeed or fail together
        const result = await ctx.db.$transaction(async (tx) => {
          // 1. Cancel existing scheduled jumps that are not in the confirmed dates
          const canceledJumps = await Promise.all(
            jumpsToCancel.map(async (jump) => {
              return tx.scheduledJump.update({
                where: { id: jump.id },
                data: { status: "CANCELED" },
              });
            }),
          );

          // 2. Handle waitlist status for canceled jump dates
          const waitlistUpdatesForCanceled = await Promise.all(
            jumpsToCancel.map(async (jump) => {
              // Normalize the date to start of day for comparison
              const jumpDateStart = new Date(jump.jumpDate);
              jumpDateStart.setHours(0, 0, 0, 0);

              // Find waitlist for this specific day
              const waitlist = await tx.waitlist.findUnique({
                where: { day: jumpDateStart },
              });

              if (
                waitlist &&
                (waitlist.status === "CLOSED" ||
                  waitlist.status === "CONFIRMED")
              ) {
                // Reopen the waitlist when we cancel a jump
                return tx.waitlist.update({
                  where: { id: waitlist.id },
                  data: { status: "OPENED" },
                });
              }
              return null;
            }),
          );

          // 3. Create new ScheduledJump records for dates that don't already exist
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
                  status: "CONFIRMED",
                  schedulingMethod: "BOOKING_WINDOW",
                },
              });
            }),
          );

          // 4. Handle waitlist status for new jump dates
          const waitlistUpdatesForNew = await Promise.all(
            datesForNewScheduledJumps.map(async (dateStr) => {
              // Normalize the date to start of day for comparison
              const jumpDateStart = new Date(dateStr);
              jumpDateStart.setHours(0, 0, 0, 0);

              // Find waitlist for this specific day
              const waitlist = await tx.waitlist.findUnique({
                where: { day: jumpDateStart },
              });

              if (waitlist && waitlist.status === "OPENED") {
                // Close the waitlist when we schedule a jump
                return tx.waitlist.update({
                  where: { id: waitlist.id },
                  data: { status: "CLOSED" },
                });
              }
              return null;
            }),
          );

          // 5. Update the booking status to CONFIRMED (if it has any confirmed dates)
          const updatedBooking = await tx.bookingWindow.update({
            where: {
              id: input.bookingId,
              bookedBy: input.bookedBy,
            },
            data: {
              status: uniqueDateStrings.length > 0 ? "CONFIRMED" : "PENDING",
            },
            include: {
              scheduledJumpDates: true,
            },
          });

          return {
            updatedBooking,
            newScheduledJumps,
            canceledJumps,
            waitlistUpdatesForCanceled:
              waitlistUpdatesForCanceled.filter(Boolean),
            waitlistUpdatesForNew: waitlistUpdatesForNew.filter(Boolean),
          };
        });

        // Count confirmed (non-canceled) scheduled jumps
        const confirmedScheduledJumps =
          result.updatedBooking.scheduledJumpDates.filter(
            (jump) => jump.status === "CONFIRMED",
          );

        return {
          success: true,
          booking: result.updatedBooking,
          newScheduledJumps: result.newScheduledJumps,
          canceledJumps: result.canceledJumps,
          newDatesCount: datesForNewScheduledJumps.length,
          canceledDatesCount: result.canceledJumps.length,
          totalConfirmedJumps: confirmedScheduledJumps.length,
          waitlistUpdates: {
            reopened: result.waitlistUpdatesForCanceled.length,
            closed: result.waitlistUpdatesForNew.length,
          },
          summary: {
            created: result.newScheduledJumps.length,
            canceled: result.canceledJumps.length,
            totalConfirmed: confirmedScheduledJumps.length,
            waitlistsReopened: result.waitlistUpdatesForCanceled.length,
            waitlistsClosed: result.waitlistUpdatesForNew.length,
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
        console.log("waitlist", waitlist);
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
            status: "CONFIRMED",
            schedulingMethod: "WAITLIST",
          },
        });
        return ctx.db.waitlist.update({
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
});
