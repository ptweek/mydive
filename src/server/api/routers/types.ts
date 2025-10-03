import type { RouterOutputs } from "mydive/trpc/react";

// BookingWindow
export type BookingWindowDto =
  RouterOutputs["bookingWindow"]["createBookingWindow"];

export type BookingWindowPopulatedDto =
  RouterOutputs["customerBookingManager"]["getBookingRequestsByUser"]["bookingWindows"][number];

// Waitlist Dto
export type WaitlistPopulatedDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["waitlists"][number];

// Waitlist Entry Dtos
export type WaitlistEntryDto =
  RouterOutputs["waitlistEntries"]["getAllWaitlistEntries"]["waitlistEntries"][number];

export type WaitlistEntryPopulatedDto =
  RouterOutputs["waitlistEntries"]["getAllWaitlistEntriesPopulated"]["waitlistEntries"][number];

export type WaitlistEntryPopulatedWithBookingZoneDto =
  RouterOutputs["customerBookingManager"]["getBookingRequestsByUser"]["waitlistEntriesWithBookingZone"][number];

// User
export type UserDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["users"][number];

// Scheduled Jumps
export type ScheduledJumpDto =
  RouterOutputs["adminBookingManager"]["getBookingReservationData"]["scheduledJumps"][number];
