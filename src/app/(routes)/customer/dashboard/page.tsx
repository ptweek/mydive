import { HydrateClient } from "mydive/trpc/server";
import DashboardClient from "./dashboard-client";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@nextui-org/react";

export default async function CustomerDashboardEntry() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return (
    <HydrateClient>
      <div
        className="flex flex-col space-y-5"
        style={{ height: "calc(100vh - 64px)" }} // I don't love this but it work
      >
        <DashboardClient />
      </div>
    </HydrateClient>
  );
}
