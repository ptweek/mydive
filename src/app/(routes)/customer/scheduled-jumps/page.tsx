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
      <div
        id="page-elements"
        className="mx-auto w-[90%] space-y-5 pt-2 sm:w-3/4"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <PageHeader
          title={"Scheduled Jumps Manager"}
          description={"See all of your scheduled jumps in one place"}
        />
        <CustomerScheduledJumpsClient scheduledJumps={scheduledJumps} />
      </div>
    </HydrateClient>
  );
}
