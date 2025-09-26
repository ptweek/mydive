import { createTRPCRouter, publicProcedure } from "mydive/server/api/trpc";

export const waitlistEntryRouter = createTRPCRouter({
  getAllWaitlistEntriesPopulated: publicProcedure.query(async ({ ctx }) => {
    const waitlistEntries = await ctx.services.waitlistEntry.findAllPopulated();
    return { waitlistEntries };
  }),
});
