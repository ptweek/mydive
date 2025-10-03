import { createTRPCRouter, publicProcedure } from "mydive/server/api/trpc";

export const waitlistEntryRouter = createTRPCRouter({
  getAllWaitlistEntries: publicProcedure.query(async ({ ctx }) => {
    const waitlistEntries = await ctx.services.waitlistEntry.findAll();
    return { waitlistEntries };
  }),
  getAllWaitlistEntriesPopulated: publicProcedure.query(async ({ ctx }) => {
    const waitlistEntries = await ctx.services.waitlistEntry.findAllPopulated();
    return { waitlistEntries };
  }),
});
