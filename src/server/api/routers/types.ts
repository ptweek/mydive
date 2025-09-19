import type { RouterOutputs } from "mydive/trpc/react";

// BookingWindow
export type BookingWindowDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["bookingWindows"][number];

export type BookingWindowPopulatedDto =
  RouterOutputs["customerBookingManager"]["getBookingRequestsByUser"]["bookingWindows"][number];

// Waitlist Dto
export type WaitlistPopulatedDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["waitlists"][number];

// Waitlist Entry Dto
export type WaitlistEntryPopulatedDto =
  RouterOutputs["customerBookingManager"]["getBookingRequestsByUser"]["waitlistEntries"][number];

// User
export type UserDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["users"][number];

// Scheduled Jumps
export type ScheduledJumpDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["scheduledJumps"][number];
