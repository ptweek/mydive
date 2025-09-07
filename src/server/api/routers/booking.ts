import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "mydive/server/api/trpc";
import type { RouterOutputs } from "mydive/trpc/react";
import z from "zod";

export const bookingRouter = createTRPCRouter({
  getBookings: publicProcedure.query(async ({ ctx }) => {
    const bookings = (await ctx.db.booking.findMany()) ?? [];
    return { bookings };
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
        numJumpers: z.number().min(1).max(5), // adjust max as needed
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
            numJumpers: input.numJumpers,
            windowStartDay: input.windowStartDay,
            windowEndDate: input.windowEndDate,
            idealizedJumpDay: input.idealizedJumpDay,
            createdById: input.createdById,
          },
        });

        return newBooking;
      } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Failed to create booking");
      }
    }),
});

export type BookingData =
  RouterOutputs["booking"]["getBookings"]["bookings"][number];
