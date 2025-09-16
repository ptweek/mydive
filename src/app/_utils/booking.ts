import type { ScheduledJump } from "@prisma/client";

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

export function setConfirmedJumpDays(dates: Date[]): string[] {
  return dates.map((date) => date.toISOString());
}
