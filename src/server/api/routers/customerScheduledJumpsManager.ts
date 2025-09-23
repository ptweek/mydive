import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import { cancelScheduledJump } from "mydive/server/businessLogic/bookingOperations";
import z from "zod";

export const customerScheduledJumpsManagerRouter = createTRPCRouter({
  getScheduledJumpsForUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const scheduledJumps = await ctx.services.scheduledJump.findAllByUserId(
        input.userId,
      );
      return { scheduledJumps };
    }),
  cancelScheduledJump,
});
