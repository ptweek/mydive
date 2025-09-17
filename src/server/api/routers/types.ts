import type { RouterOutputs } from "mydive/trpc/react";

// BookingWindow
export type BookingWindowPopulatedDto =
  RouterOutputs["bookingWindow"]["getBookingRequestsByUser"]["bookingWindows"][number];

// User
export type UserDto =
  RouterOutputs["adminBookingManager"]["getBookingRequestsWithUsers"]["users"][number];
