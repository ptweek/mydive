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
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src="/videos/skydiving-background.mp4" type="video/mp4" />
        </video>

        {/* Content */}
        <ScheduledJumpsClient scheduledJumps={scheduledJumps} users={users} />
      </main>
    </HydrateClient>
  );
}
