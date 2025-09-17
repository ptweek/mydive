import { clerkClient, type User } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "mydive/server/api/trpc";
import type { RouterOutputs } from "mydive/trpc/react";

type ClerkUserDto = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string[];
  phoneNumbers: string[];
};

const clerkUserToDto = (user: User): ClerkUserDto => {
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
};

export const adminBookingManagerRouter = createTRPCRouter({
  getBookingRequestsWithUsers: publicProcedure.query(async ({ ctx }) => {
    const client = await clerkClient();
    const bookingWindows = await ctx.services.bookingWindow.findAllPopulated();
    const userIds = [...new Set(bookingWindows.map((b) => b.bookedBy))];
    const users = (await client.users.getUserList({ userId: userIds })).data;
    const userData = users.map((user) => {
      return clerkUserToDto(user);
    });
    return { bookingWindows, users: userData };
  }),
});
