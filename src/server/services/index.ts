import type { PrismaClient } from "@prisma/client";
import { BookingWindowService } from "./bookingWindow";
import { WaitlistService } from "./waitlist";
import { ScheduledJumpService } from "./scheduledJump";
import { WaitlistEntryService } from "./waitlistEntry";

export interface ServiceContainer {
  bookingWindow: BookingWindowService;
  waitlist: WaitlistService;
  scheduledJump: ScheduledJumpService;
  waitlistEntry: WaitlistEntryService;
}

export const createServices = (db: PrismaClient): ServiceContainer => {
  return {
    bookingWindow: new BookingWindowService(db),
    waitlist: new WaitlistService(db),
    scheduledJump: new ScheduledJumpService(db),
    waitlistEntry: new WaitlistEntryService(db),
  };
};

// Individual exports if you need them elsewhere
export { BookingWindowService } from "./bookingWindow";
export { WaitlistService } from "./waitlist";
export { ScheduledJumpService } from "./scheduledJump";
export { WaitlistEntryService } from "./waitlistEntry";
