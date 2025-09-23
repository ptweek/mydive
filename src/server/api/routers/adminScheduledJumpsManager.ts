import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import { cancelScheduledJump } from "mydive/server/businessLogic/bookingOperations";
import { clerkUserToDto } from "./adminBookingManager";

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
  cancelScheduledJump,
});
