import type { ScheduledJump, SchedulingMethod } from "@prisma/client";
import moment from "moment";
import type { WaitlistWithUsers } from "mydive/app/(routes)/admin/manage-booking-requests/types";
import type { WaitlistPopulatedDto } from "mydive/server/api/routers/types";

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

// Active is defined as scheduled, and has not happened yet.
export const getActiveScheduledJumpFromPopulatedWaitlist = (
  waitlist: WaitlistPopulatedDto | WaitlistWithUsers,
) => {
  const scheduledJump = waitlist.associatedScheduledJumps.find(
    (scheduledJump) => {
      return scheduledJump.status === "SCHEDULED";
    },
  );
  return scheduledJump;
};

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

export const formatDateShort = (date: Date) => {
  return moment.utc(date).format("MMM DD YYYY");
};
