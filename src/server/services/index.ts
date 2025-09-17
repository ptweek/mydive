import type { PrismaClient } from "@prisma/client";
import { BookingWindowService } from "./bookingWindow";
import { WaitlistService } from "./waitlist";

export interface ServiceContainer {
  bookingWindow: BookingWindowService;
  waitlist: WaitlistService;
}

export const createServices = (db: PrismaClient): ServiceContainer => {
  return {
    bookingWindow: new BookingWindowService(db),
    waitlist: new WaitlistService(db),
  };
};

// Individual exports if you need them elsewhere
export { BookingWindowService } from "./bookingWindow";
export { WaitlistService } from "./waitlist";
