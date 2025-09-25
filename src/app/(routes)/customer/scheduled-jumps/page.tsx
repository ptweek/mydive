import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CustomerScheduledJumpsClient from "./client-page";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

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
      <div className="mx-auto mb-5 flex h-screen w-[90%] flex-col space-y-3 sm:w-3/4">
        <PageHeader
          title={"Scheduled Jumps Manager"}
          description={"See all of your scheduled jumps in one place"}
        />
        <CustomerScheduledJumpsClient scheduledJumps={scheduledJumps} />
      </div>
    </HydrateClient>
  );
}
