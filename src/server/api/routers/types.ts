import type { RouterOutputs } from "mydive/trpc/react";

// BookingWindow
export type BookingWindowDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["bookingWindows"][number];

export type BookingWindowPopulatedDto =
  RouterOutputs["bookingWindow"]["getBookingRequestsByUser"]["bookingWindows"][number];

// Waitlist Dto
export type WaitlistPopulatedDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["waitlists"][number];

// User
export type UserDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["users"][number];

// Scheduled Jumps
export type ScheduledJumpDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["scheduledJumps"][number];
