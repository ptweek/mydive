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
      <main className="relative flex min-h-screen flex-col overflow-hidden text-white">
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

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 z-0 bg-black/40"></div>

        {/* Content */}
        <CustomerScheduledJumpsClient scheduledJumps={scheduledJumps} />
      </main>
    </HydrateClient>
  );
}
