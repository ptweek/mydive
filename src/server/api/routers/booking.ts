import { createTRPCRouter, publicProcedure } from "mydive/server/api/trpc";

export const bookingRouter = createTRPCRouter({
  getBookings: publicProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.db.booking.findMany();
    return { bookings };
  }),
});
