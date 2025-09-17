import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "mydive/server/api/trpc";
import type { RouterOutputs } from "mydive/trpc/react";
import z from "zod";

export const bookingWindowRouter = createTRPCRouter({
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
  getBookings: publicProcedure
    .input(
      z
        .object({
          status: z
            .object({
              not: z.enum(["PENDING", "CONFIRMED", "CANCELED"]),
            })
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const whereClause = input?.status ? { status: input.status } : {};
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
  createBooking: protectedProcedure
    .input(
      z.object({
        numJumpers: z.number().min(1).max(10), // adjust max as needed
        windowStartDate: z.date(),
        windowEndDate: z.date(),
        idealizedJumpDay: z.date(),
        createdById: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate that windowEndDate is after windowStartDay
      if (input.windowEndDate <= input.windowStartDate) {
        throw new Error("Window end date must be after start date");
      }

      // Validate that idealizedJumpDay is within the window
      if (
        input.idealizedJumpDay < input.windowStartDate ||
        input.idealizedJumpDay > input.windowEndDate
      ) {
        throw new Error("Idealized jump day must be within the booking window");
      }

      try {
        const newBooking = await ctx.db.bookingWindow.create({
          data: {
            bookingZone: "DEFAULT", // need to add booking zones in the future
            numJumpers: input.numJumpers,
            windowStartDate: input.windowStartDate,
            windowEndDate: input.windowEndDate,
            idealizedJumpDate: input.idealizedJumpDay,
            bookedBy: input.createdById,
            status: "PENDING", // new field
          },
        });

        return newBooking;
      } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Failed to create booking");
      }
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
        const uniqueDates = uniqueDateStrings.map(
          (dateStr) => new Date(dateStr),
        );

        // Get existing scheduled jumps for this booking
        const existingScheduledJumps =
          existingBooking.scheduledJumpDates.filter((scheduledJumpDate) => {
            return scheduledJumpDate.status !== "CANCELED";
          });

        // Convert confirmed dates to ISO strings for comparison
        const confirmedDateISOStrings = uniqueDateStrings.map((dateStr) =>
          new Date(dateStr).toISOString(),
        );

        // Find existing jumps that should be canceled (not in the new confirmed dates)
        const jumpsToCancel = existingScheduledJumps.filter(
          (jump) =>
            !confirmedDateISOStrings.includes(jump.jumpDate.toISOString()),
        );

        // Find dates that need new scheduled jumps (not already existing)
        const existingJumpDateStrings = existingScheduledJumps.map((jump) =>
          jump.jumpDate.toISOString(),
        );

        const newDates = uniqueDateStrings.filter(
          (dateStr) =>
            !existingJumpDateStrings.includes(new Date(dateStr).toISOString()),
        );

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

          // 2. Create new ScheduledJump records for dates that don't already exist
          const newScheduledJumps = await Promise.all(
            newDates.map(async (dateStr) => {
              return tx.scheduledJump.create({
                data: {
                  jumpDate: new Date(dateStr),
                  bookingZone: existingBooking.bookingZone,
                  numJumpers: existingBooking.numJumpers,
                  associatedBookingId: input.bookingId,
                  bookedBy: input.bookedBy,
                  confirmedBy: input.confirmedBy,
                  status: "CONFIRMED",
                },
              });
            }),
          );

          // 3. Update the booking status to CONFIRMED (if it has any confirmed dates)
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
          newDatesCount: newDates.length,
          canceledDatesCount: result.canceledJumps.length,
          totalConfirmedJumps: confirmedScheduledJumps.length,
          summary: {
            created: result.newScheduledJumps.length,
            canceled: result.canceledJumps.length,
            totalConfirmed: confirmedScheduledJumps.length,
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
  joinWaitlist: protectedProcedure
    .input(
      z.object({
        day: z.date(), // The day they want to join the waitlist for
        associatedBookingId: z.number(), // The booking this waitlist is associated with
        userId: z.string(), // Clerk user ID
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First, verify the booking exists
        const existingBooking = await ctx.db.bookingWindow.findFirst({
          where: {
            id: input.associatedBookingId,
          },
        });

        if (!existingBooking) {
          throw new Error("Booking not found");
        }

        // Check if a waitlist already exists for this day
        let waitlist = await ctx.db.waitlist.findFirst({
          where: {
            day: input.day,
          },
          include: {
            entries: {
              orderBy: {
                position: "asc",
              },
            },
          },
        });

        // If no waitlist exists, create one
        waitlist ??= await ctx.db.waitlist.create({
          data: {
            day: input.day,
            associatedBookingId: input.associatedBookingId,
          },
          include: {
            entries: true,
          },
        });

        // Check if the user is already on this waitlist
        const existingEntry = await ctx.db.waitlistEntry.findFirst({
          where: {
            waitlistId: waitlist.id,
            waitlistedUserId: input.userId,
          },
        });

        if (existingEntry) {
          throw new Error("User is already on this waitlist");
        }

        // Determine the next position number
        const maxPosition =
          waitlist.entries.length > 0
            ? Math.max(...waitlist.entries.map((entry) => entry.position))
            : 0;
        const nextPosition = maxPosition + 1;

        // Create the waitlist entry
        await ctx.db.waitlistEntry.create({
          data: {
            waitlistId: waitlist.id,
            waitlistedUserId: input.userId,
            position: nextPosition,
          },
        });

        // Return the updated waitlist with all entries
        const updatedWaitlist = await ctx.db.waitlist.findFirst({
          where: {
            id: waitlist.id,
          },
          include: {
            entries: {
              orderBy: {
                position: "asc",
              },
            },
            associatedBooking: true,
          },
        });

        return {
          success: true,
          waitlist: updatedWaitlist,
          userPosition: nextPosition,
          message:
            waitlist.entries.length === 0
              ? "Waitlist created and you've been added to position 1"
              : `You've been added to waitlist position ${nextPosition}`,
        };
      } catch (error) {
        console.error("Error joining waitlist:", error);

        // Re-throw known errors, wrap unknown ones
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Failed to join waitlist");
      }
    }),
  getWaitlistInfo: protectedProcedure
    .input(
      z.object({
        day: z.date(), // The day to check waitlist info for
        userId: z.string(), // Clerk user ID to check their position
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Find the waitlist for the specified day
        const waitlist = await ctx.db.waitlist.findFirst({
          where: {
            day: input.day,
          },
          include: {
            entries: {
              orderBy: {
                position: "asc",
              },
            },
            associatedBooking: {
              select: {
                id: true,
                status: true,
                bookingZone: true,
                numJumpers: true,
              },
            },
          },
        });

        // If no waitlist exists for this day
        if (!waitlist) {
          return {
            exists: false,
            totalCount: 0,
            userPosition: null,
            isUserOnWaitlist: false,
            waitlistId: null,
            associatedBooking: null,
            entries: [],
          };
        }

        // Find the user's position on the waitlist
        const userEntry = waitlist.entries.find(
          (entry) => entry.waitlistedUserId === input.userId,
        );
        const userPosition = userEntry ? userEntry.position : null;
        const isUserOnWaitlist = userEntry !== undefined;

        // Get basic info about other users on the waitlist (without sensitive data)
        const entriesInfo = waitlist.entries.map((entry) => ({
          id: entry.id,
          position: entry.position,
          createdAt: entry.createdAt,
          isCurrentUser: entry.waitlistedUserId === input.userId,
          // Note: We don't expose other users' userIds for privacy
        }));

        return {
          exists: true,
          waitlistId: waitlist.id,
          totalCount: waitlist.entries.length,
          userPosition: userPosition,
          isUserOnWaitlist: isUserOnWaitlist,
          associatedBooking: waitlist.associatedBooking,
          entries: entriesInfo,
          day: waitlist.day,
        };
      } catch (error) {
        console.error("Error fetching waitlist info:", error);
        throw new Error("Failed to fetch waitlist information");
      }
    }),
});
