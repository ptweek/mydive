import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedDto,
} from "mydive/server/api/routers/types";
import type { BookingStatus } from "@prisma/client";

export function calculateBookingStats(
  bookingWindows: BookingWindowPopulatedDto[],
  loadedWaitlistEntries: WaitlistEntryPopulatedDto[],
) {
  const statusCounts: {
    bws: Record<string, number>;
    wles: Record<string, number>;
  } = {
    bws: {},
    wles: {},
  };

  let totalJumpers = 0;

  // Count booking windows
  bookingWindows.forEach((b) => {
    statusCounts.bws[b.status] = (statusCounts.bws[b.status] ?? 0) + 1;
    totalJumpers += b.numJumpers;
  });

  // Count waitlist entries
  loadedWaitlistEntries.forEach((w) => {
    statusCounts.wles[w.status] = (statusCounts.wles[w.status] ?? 0) + 1;
  });

  totalJumpers += loadedWaitlistEntries.length;

  return {
    total: bookingWindows.length + loadedWaitlistEntries.length,
    confirmedBws: statusCounts.bws.CONFIRMED ?? 0,
    confirmedWles: statusCounts.wles.CONFIRMED ?? 0,
    cancelledBws: statusCounts.bws.CANCELED ?? 0,
    cancelledWles: statusCounts.wles.CANCELED ?? 0,
    completedBws: statusCounts.bws.COMPLETED ?? 0,
    completedWles: statusCounts.wles.COMPLETED ?? 0,
    pendingBws: statusCounts.bws.PENDING ?? 0,
    pendingWles: statusCounts.wles.PENDING ?? 0,
    totalJumpers,
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
      case "CONFIRMED":
        confirmedJumps++;
        break;
      case "PENDING":
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
