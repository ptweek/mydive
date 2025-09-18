import { clerkClient, type User } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "mydive/server/api/trpc";
import type { RouterOutputs } from "mydive/trpc/react";

type UserDto = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string[];
  phoneNumbers: string[];
};

const clerkUserToDto = (user: User): UserDto => {
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
  // In the future, I should only fetch this information a single time per month, and cache previous months.
  getBookingReservationData: publicProcedure.query(async ({ ctx }) => {
    const client = await clerkClient();
    const bookingWindows = await ctx.services.bookingWindow.findAll();
    const waitlists = await ctx.services.waitlist.findAllPopulated();
    const scheduledJumps = await ctx.services.scheduledJump.findAll();

    // Collect user IDs from BOTH booking windows AND waitlist entries
    const bookingUserIds = bookingWindows.map((b) => b.bookedBy);
    const waitlistUserIds = waitlists.flatMap((waitlist) =>
      waitlist.entries.map((entry) => entry.waitlistedUserId),
    );

    // Combine and deduplicate all user IDs
    const allUserIds = [...new Set([...bookingUserIds, ...waitlistUserIds])];

    // Fetch all users at once
    const users = (await client.users.getUserList({ userId: allUserIds })).data;
    const userData = users.map((user) => {
      return clerkUserToDto(user);
    });

    return { bookingWindows, waitlists, scheduledJumps, users: userData };
  }),
});
