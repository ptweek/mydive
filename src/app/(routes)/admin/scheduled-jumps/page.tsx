import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import ScheduledJumpsClient from "./client-page";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

// Probably need to implement some fetch that allows us to get all the admin users!

export default async function AdminScheduledJumpsManager() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return (
    <HydrateClient>
      <div
        id="page-elements"
        className="mx-auto w-[90%] space-y-5 pt-2 sm:w-3/4"
        style={{ height: "calc(100vh - 150px)" }}
      >
        <PageHeader
          title="Scheduled Jumps Manager"
          description="See all of your scheduled jumps in one place"
        />
        <ScheduledJumpsClient />
      </div>
    </HydrateClient>
  );
}
