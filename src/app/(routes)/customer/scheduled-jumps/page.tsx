import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import CustomerScheduledJumpsClient from "./client-page";

export default async function ScheduledJumpsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const { scheduledJumps } =
    await api.customerScheduledJumpsManager.getScheduledJumpsForUser({
      userId: user.id,
    });
  return (
    <HydrateClient>
      <CustomerScheduledJumpsClient scheduledJumps={scheduledJumps} />
    </HydrateClient>
  );
}
