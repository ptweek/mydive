import type { WaitlistEntry } from "@prisma/client";
import type {
  BookingWindowDto,
  ScheduledJumpDto,
  UserDto,
  WaitlistPopulatedDto,
} from "mydive/server/api/routers/types";

export interface WaitlistEntryWithUser extends WaitlistEntry {
  user?: UserDto; // Optional in case user lookup fails
}

export interface WaitlistWithUsers
  extends Omit<WaitlistPopulatedDto, "entries"> {
  entries: WaitlistEntryWithUser[];
}

export interface BookingWindowWithUser extends BookingWindowDto {
  bookedByUser?: UserDto; // Optional in case user lookup fails
}

// Formatted table data structure
export interface BookingTableRow extends BookingWindowWithUser {
  waitlists: WaitlistWithUsers[];
  scheduledJumpDates: ScheduledJumpDto[];
}

export type BookingTableData = BookingTableRow[];
