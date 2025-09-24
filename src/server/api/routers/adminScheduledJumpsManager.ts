import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import { cancelScheduledJump } from "mydive/server/businessLogic/bookingOperations";
import { clerkUserToDto } from "./adminBookingManager";
import { createTextChangeRange } from "typescript";
import z from "zod";

export const adminScheduledJumpsManagerRouter = createTRPCRouter({
  getScheduledJumpsAndUsers: protectedProcedure.query(async ({ ctx }) => {
    const client = await clerkClient();
    const scheduledJumps = await ctx.services.scheduledJump.findAll();

    const allUserIds = scheduledJumps.map((scheduledJump) => {
      return scheduledJump.bookedBy;
    });

    // Fetch all users at once
    const users = (await client.users.getUserList({ userId: allUserIds })).data;
    const userData = users.map((user) => {
      return clerkUserToDto(user);
    });

    return { scheduledJumps, users: userData };
  }),
  completeScheduledJump: protectedProcedure
    .input(
      z.object({
        scheduledJumpId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.services.scheduledJump.completeById(input.scheduledJumpId);
      } catch (error) {
        console.error("Error completing scheduled jump:", error);
        throw new Error("Failed to complete scheduled jump");
      }
    }),
  cancelScheduledJump,
});
