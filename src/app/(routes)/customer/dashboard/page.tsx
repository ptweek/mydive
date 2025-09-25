import { HydrateClient } from "mydive/trpc/server";
import DashboardClient from "./dashboard-client";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CustomerDashboardEntry() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return (
    <HydrateClient>
      <DashboardClient />
    </HydrateClient>
  );
}
