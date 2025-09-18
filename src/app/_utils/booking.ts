import type { ScheduledJump, SchedulingMethod } from "@prisma/client";

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
