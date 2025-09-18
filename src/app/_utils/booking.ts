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

export function getActiveScheduledJumpDates(
  scheduledJumps: ScheduledJump[],
): Date[] {
  if (!scheduledJumps || !Array.isArray(scheduledJumps)) {
    return [];
  }
  console.log("scheduledJumps", scheduledJumps);
  console.log(
    "returning",
    scheduledJumps
      .filter((scheduledJumpDate) => scheduledJumpDate.status !== "CANCELED")
      .map((scheduledJumpDate) => scheduledJumpDate.jumpDate),
  );
  return scheduledJumps
    .filter((scheduledJumpDate) => scheduledJumpDate.status !== "CANCELED")
    .map((scheduledJumpDate) => scheduledJumpDate.jumpDate);
}

export function setConfirmedJumpDays(dates: Date[]): string[] {
  return dates.map((date) => date.toISOString());
}
