import type {
  BookingWindowPopulatedDto,
  WaitlistPopulatedDto,
} from "mydive/server/api/routers/types";
import { BookingStatus } from "@prisma/client";

export type BookingWindowRequestStats = {
  pendingDeposit: number;
  scheduledBookingWindows: number;
  unscheduledBookingWindows: number;
  openWaitlists: number;
  canceledBookingWindows: number;
};

export function calculateAdminBookingRequestsStats(
  bookingWindows: BookingWindowPopulatedDto[],
  waitlists: WaitlistPopulatedDto[],
): BookingWindowRequestStats {
  return {
    pendingDeposit: bookingWindows.filter((bw) => {
      return bw.status === BookingStatus.PENDING_DEPOSIT;
    }).length,
    scheduledBookingWindows: bookingWindows.filter((bw) => {
      return bw.status === BookingStatus.SCHEDULED;
    }).length,
    unscheduledBookingWindows: bookingWindows.filter((bw) => {
      return bw.status === BookingStatus.UNSCHEDULED;
    }).length,
    openWaitlists: waitlists.filter((wl) => {
      return wl.status === "OPENED";
    }).length,
    canceledBookingWindows: bookingWindows.filter((bw) => {
      return bw.status === BookingStatus.CANCELED;
    }).length,
  };
}

// Define the SchedulingMethod enum to match your schema
export type SchedulingMethod = "BOOKING_WINDOW" | "WAITLIST";

// Type for your ScheduledJump data
export type ScheduledJumpData = {
  id: number;
  status: BookingStatus;
  jumpDate: Date;
  bookingZone: string;
  numJumpers: number;
  schedulingMethod: SchedulingMethod;
  bookedBy: string;
  confirmedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  associatedBookingId: number;
  associatedWaitlistId?: number | null;
};

// Stats interface that matches the component
export type ScheduledJumpStats = {
  total: number;
  confirmedJumps: number;
  pendingJumps: number;
  completedJumps: number;
  cancelledJumps: number;
  totalJumpers: number;
  bookingWindowJumps: number;
  waitlistJumps: number;
};

/**
 * Computes statistics for scheduled jumps
 * @param scheduledJumps Array of scheduled jump data
 * @returns ScheduledJumpStats object with computed statistics
 */
export function computeScheduledJumpStats(
  scheduledJumps: ScheduledJumpData[],
): ScheduledJumpStats {
  // Initialize counters
  let confirmedJumps = 0;
  let pendingJumps = 0;
  let completedJumps = 0;
  let cancelledJumps = 0;
  let totalJumpers = 0;
  let bookingWindowJumps = 0;
  let waitlistJumps = 0;

  // Process each scheduled jump
  for (const jump of scheduledJumps) {
    // Count total jumpers across all jumps
    totalJumpers += jump.numJumpers;

    // Count by scheduling method
    if (jump.schedulingMethod === "BOOKING_WINDOW") {
      bookingWindowJumps++;
    } else if (jump.schedulingMethod === "WAITLIST") {
      waitlistJumps++;
    }

    // Count by status
    switch (jump.status) {
      case "SCHEDULED":
        confirmedJumps++;
        break;
      case "UNSCHEDULED":
        pendingJumps++;
        break;
      case "COMPLETED":
        completedJumps++;
        break;
      case "CANCELED":
        cancelledJumps++;
        break;
      // Handle any other status values that might exist
      default:
        break;
    }
  }

  return {
    total: scheduledJumps.length,
    confirmedJumps,
    pendingJumps,
    completedJumps,
    cancelledJumps,
    totalJumpers,
    bookingWindowJumps,
    waitlistJumps,
  };
}
