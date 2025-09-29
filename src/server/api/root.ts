import { createCallerFactory, createTRPCRouter } from "mydive/server/api/trpc";
import { bookingWindowRouter } from "mydive/server/api/routers/bookingWindow";
import { adminBookingManagerRouter } from "./routers/adminBookingManager";
import { customerBookingManagerRouter } from "./routers/customerBookingManager";
import { adminScheduledJumpsManagerRouter } from "./routers/adminScheduledJumpsManager";
import { customerScheduledJumpsManagerRouter } from "./routers/customerScheduledJumpsManager";
import { waitlistEntryRouter } from "./routers/waitlistEntry";
import { customerPaymentsRouter } from "./routers/customerPaymentsRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  waitlistEntries: waitlistEntryRouter,
  bookingWindow: bookingWindowRouter,
  adminBookingManager: adminBookingManagerRouter,
  customerBookingManager: customerBookingManagerRouter,
  adminScheduledJumpsManager: adminScheduledJumpsManagerRouter,
  customerPayments: customerPaymentsRouter,
  customerScheduledJumpsManager: customerScheduledJumpsManagerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
