import { clerkClient } from "@clerk/nextjs/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "mydive/server/api/trpc";
import type { RouterOutputs } from "mydive/trpc/react";
import z from "zod";

export const bookingRouter = createTRPCRouter({
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

      const bookings = await ctx.db.booking.findMany({
        where: whereClause,
      });

      return { bookings };
    }),
  // Probably will want some query parameters in the future.
  getBookingsWithUser: publicProcedure.query(async ({ ctx }) => {
    const client = await clerkClient();
    const bookings = await ctx.db.booking.findMany();
    const userIds = [...new Set(bookings.map((b) => b.createdById))];
    const users = (await client.users.getUserList({ userId: userIds })).data;
    const userData = users.map((user) => {
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
    });
    return { bookings, users: userData };
  }),
  getBookingsByUser: protectedProcedure
    .input(
      z.object({
        createdById: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const bookings = await ctx.db.booking.findMany({
          where: {
            createdById: input.createdById,
          },
        });

        return { bookings };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
      }
    }),
  createBooking: protectedProcedure
    .input(
      z.object({
        numJumpers: z.number().min(1).max(10), // adjust max as needed
        windowStartDay: z.date(),
        windowEndDate: z.date(),
        idealizedJumpDay: z.date(),
        createdById: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate that windowEndDate is after windowStartDay
      if (input.windowEndDate <= input.windowStartDay) {
        throw new Error("Window end date must be after start date");
      }

      // Validate that idealizedJumpDay is within the window
      if (
        input.idealizedJumpDay < input.windowStartDay ||
        input.idealizedJumpDay > input.windowEndDate
      ) {
        throw new Error("Idealized jump day must be within the booking window");
      }

      try {
        const newBooking = await ctx.db.booking.create({
          data: {
            bookingZone: "DEFAULT", // need to add booking zones in the future
            numJumpers: input.numJumpers,
            windowStartDay: input.windowStartDay,
            windowEndDate: input.windowEndDate,
            idealizedJumpDay: input.idealizedJumpDay,
            createdById: input.createdById,
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
        createdById: z.string(),
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedBooking = await ctx.db.booking.update({
          data: {
            status: "CANCELED",
          },
          where: {
            createdById: input.createdById,
            id: input.id,
          },
        });
        return { success: true, booking: updatedBooking };
      } catch (error) {
        console.error("Error fetching bookings by user:", error);
        throw new Error("Failed to fetch user bookings");
      }
    }),
  confirmBookingDays: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        createdById: z.string(),
        confirmedDates: z.array(z.string().datetime()), // ISO date strings
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First, verify the booking exists and belongs to the user
        const existingBooking = await ctx.db.booking.findFirst({
          where: {
            id: input.bookingId,
            createdById: input.createdById,
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
        const windowStart = new Date(existingBooking.windowStartDay);
        const windowEnd = new Date(existingBooking.windowEndDate);

        for (const date of confirmedDates) {
          if (date < windowStart || date > windowEnd) {
            throw new Error(
              `All confirmed dates must be within the booking window (${windowStart.toDateString()} - ${windowEnd.toDateString()})`,
            );
          }
        }

        // Remove duplicate dates and sort them
        const uniqueDates = [...new Set(input.confirmedDates)].sort();

        // Update the booking with confirmed dates and change status to CONFIRMED
        const updatedBooking = await ctx.db.booking.update({
          where: {
            id: input.bookingId,
            createdById: input.createdById,
          },
          data: {
            confirmedJumpDays: uniqueDates, // Store as JSON array of ISO date strings
            status: "CONFIRMED",
          },
        });

        return {
          success: true,
          booking: updatedBooking,
          confirmedDatesCount: uniqueDates.length,
        };
      } catch (error) {
        console.error("Error confirming booking days:", error);

        // Re-throw known errors, wrap unknown ones
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Failed to confirm booking days");
      }
    }),
});

export type BookingDto =
  RouterOutputs["booking"]["getBookings"]["bookings"][number];
export type UserDto =
  RouterOutputs["booking"]["getBookingsWithUser"]["users"][number];
