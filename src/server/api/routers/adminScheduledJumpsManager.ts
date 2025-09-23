import { createTRPCRouter } from "mydive/server/api/trpc";
import { cancelScheduledJump } from "mydive/server/businessLogic/bookingOperations";

export const adminScheduledJumpsManagerRouter = createTRPCRouter({
  cancelScheduledJump,
});
