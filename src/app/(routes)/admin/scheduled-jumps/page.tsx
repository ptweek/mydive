import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import ScheduledJumpsClient from "./client-page";

// Probably need to implement some fetch that allows us to get all the admin users!

export default async function AdminScheduledJumpsManager() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const { scheduledJumps, users } =
    await api.adminScheduledJumpsManager.getScheduledJumpsAndUsers();
  return (
    <HydrateClient>
      <ScheduledJumpsClient scheduledJumps={scheduledJumps} users={users} />
    </HydrateClient>
  );
}
