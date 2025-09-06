import { createTRPCRouter, publicProcedure } from "mydive/server/api/trpc";
import type { RouterOutputs } from "mydive/trpc/react";

export const bookingRouter = createTRPCRouter({
  getBookings: publicProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.db.booking.findMany();
    return { bookings };
  }),
});

export type BookingData =
  RouterOutputs["booking"]["getBookings"]["bookings"][number];
