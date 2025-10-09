import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "mydive/server/api/trpc";
import { cancelScheduledJump } from "mydive/server/businessLogic/bookingOperations";
import { clerkUserToDto } from "./adminBookingManager";
import z from "zod";

export const adminScheduledJumpsManagerRouter = createTRPCRouter({
  getScheduledJumpsCount: protectedProcedure
    .input(
      z.object({
        jumpDate: z.object({
          gte: z.date(),
          lt: z.date(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereQuery = {
        jumpDate: {
          gte: input.jumpDate.gte,
          lt: input.jumpDate.lt,
        },
      };
      return await ctx.db.scheduledJump.count({
        where: whereQuery,
      });
    }),
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
  getScheduledJumpsAndUsersPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number(),
        limit: z.number(),
        jumpDate: z.object({
          gte: z.date(),
          lt: z.date(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const client = await clerkClient();
      const scheduledJumps = await ctx.services.scheduledJump.findManyPaginated(
        {
          limit: input.limit,
          page: input.page,
          query: {
            jumpDate: {
              gte: input.jumpDate.gte,
              lt: input.jumpDate.lt,
            },
          },
        },
      );

      const allUserIds = scheduledJumps.map((scheduledJump) => {
        return scheduledJump.bookedBy;
      });

      // Fetch all users at once
      const users = (await client.users.getUserList({ userId: allUserIds }))
        .data;
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
