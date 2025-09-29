import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import {
  cancelBookingWindow,
  removeWaitlistEntry,
} from "mydive/server/businessLogic/bookingOperations";
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
        const waitlistBookingWindowIds = Array.from(
          new Set(
            waitlistEntries.map((waitlistEntry) => {
              return waitlistEntry.waitlist.associatedBookingId;
            }),
          ),
        );
        const waitlistEntriesBookingWindows =
          await ctx.services.bookingWindow.findMany({
            ids: waitlistBookingWindowIds,
          });

        const waitlistEntriesWithBookingZone = waitlistEntries.map(
          (waitlistEntry) => {
            const bookingZone = waitlistEntriesBookingWindows.find(
              (bookingWindow) => {
                return (
                  bookingWindow.id ===
                  waitlistEntry.waitlist.associatedBookingId
                );
              },
            )?.bookingZone;
            if (!bookingZone) {
              throw new Error(
                "Couldn't find booking zone for the waitlist entry!",
              );
            }
            return {
              ...waitlistEntry,
              bookingZone,
            };
          },
        );

        return { bookingWindows, waitlistEntriesWithBookingZone };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
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
                activePosition: "asc",
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
            status: { not: "CANCELED" },
            waitlistedUserId: input.userId,
          },
        });

        if (existingEntry) {
          throw new Error("User is already on this waitlist");
        }

        const activeWaitlistEntries = waitlist.entries.filter((entry) => {
          return entry.status !== "CANCELED";
        });
        console.log("activeWaitlistEntries", activeWaitlistEntries);

        // Determine the next position number
        const maxPosition =
          activeWaitlistEntries.length > 0
            ? Math.max(
                ...waitlist.entries.map((entry) => {
                  if (!entry.activePosition) {
                    throw new Error(
                      "Active entry does not have active position!",
                    );
                  }
                  return entry.activePosition;
                }),
              )
            : 0;
        console.log("maxPosition", maxPosition);
        const nextPosition = maxPosition + 1;

        // Create the waitlist entry
        await ctx.db.waitlistEntry.create({
          data: {
            waitlistId: waitlist.id,
            waitlistedUserId: input.userId,
            activePosition: nextPosition,
            latestPosition: nextPosition,
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
                activePosition: "asc",
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
                activePosition: "asc",
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

        // If no waitlist exists for this day or no users on the waitlist that was created
        if (
          !waitlist ||
          waitlist?.entries.filter((entry) => {
            return entry.status !== "CANCELED";
          }).length < 1
        ) {
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
        const userPosition = userEntry ? userEntry.activePosition : null;
        const isUserOnWaitlist = userEntry !== undefined;

        // Get basic info about other users on the waitlist (without sensitive data)
        const entriesInfo = waitlist.entries.map((entry) => ({
          id: entry.id,
          activePosition: entry.activePosition,
          latestPosition: entry.latestPosition,
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
  removeWaitlistEntry,
  cancelBookingWindow,
});
