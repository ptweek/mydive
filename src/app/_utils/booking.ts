import type { ScheduledJump, SchedulingMethod } from "@prisma/client";
import moment from "moment";
import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedDto,
} from "mydive/server/api/routers/types";

export function getActiveScheduledJumpDatesFromBookingWindow(bookingWindow: {
  scheduledJumpDates: ScheduledJump[];
}): Date[] {
  if (
    !bookingWindow.scheduledJumpDates ||
    !Array.isArray(bookingWindow.scheduledJumpDates)
  ) {
    return [];
  }
  return bookingWindow.scheduledJumpDates
    .filter((scheduledJumpDate) => scheduledJumpDate.status !== "CANCELED")
    .map((scheduledJumpDate) => scheduledJumpDate.jumpDate);
}

export function getActiveScheduledJumps(
  scheduledJumps: ScheduledJump[],
  schedulingMethod: SchedulingMethod,
): ScheduledJump[] {
  if (!scheduledJumps || !Array.isArray(scheduledJumps)) {
    return [];
  }
  return scheduledJumps.filter((scheduledJumpDate) => {
    return (
      scheduledJumpDate.status !== "CANCELED" &&
      scheduledJumpDate.schedulingMethod === schedulingMethod
    );
  });
}

export function getActiveScheduledJumpDates(
  scheduledJumps: ScheduledJump[],
  schedulingMethod: SchedulingMethod,
): Date[] {
  if (!scheduledJumps || !Array.isArray(scheduledJumps)) {
    return [];
  }
  return scheduledJumps
    .filter((scheduledJumpDate) => {
      return (
        scheduledJumpDate.status !== "CANCELED" &&
        scheduledJumpDate.schedulingMethod === schedulingMethod
      );
    })
    .map((scheduledJumpDate) => scheduledJumpDate.jumpDate);
}

export function setConfirmedJumpDays(dates: Date[]): string[] {
  return dates.map((date) => date.toISOString());
}

export const formatDateShort = (date: Date) => {
  return moment(date).format("MMM DD YYYY");
};
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
