import { auth } from "mydive/server/auth";
import { api, HydrateClient } from "mydive/trpc/server";
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

          {/* Fallback gradient background */}
        </video>

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 z-10 bg-black/40"></div>

        {/* Content */}
        <DashboardClient userId={user.id} />
      </main>
    </HydrateClient>
  );
}
