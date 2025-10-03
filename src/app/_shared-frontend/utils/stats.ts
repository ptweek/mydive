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
  scheduledJumps: number;
  completedJumps: number;
  canceledJumps: number;
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
  let scheduled = 0;
  let canceled = 0;
  let completed = 0;
  // Process each scheduled jump
  for (const jump of scheduledJumps) {
    // Count by status
    switch (jump.status) {
      case "SCHEDULED":
        scheduled++;
        break;
      case "COMPLETED":
        completed++;
        break;
      case "CANCELED":
        canceled++;
        break;
      // Handle any other status values that might exist
      default:
        break;
    }
  }

  return {
    total: scheduledJumps.length,
    scheduledJumps: scheduled,
    completedJumps: completed,
    canceledJumps: canceled,
  };
}
