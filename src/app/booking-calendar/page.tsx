import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalendarClient from "./components/calendar/calendar";

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
        </video>
        x{/* Dark overlay for better text readability */}
        <div className="absolute inset-0 z-0 bg-black/40"></div>
        {/* Content */}
        <div className="z-10 flex w-full justify-center">
          <div className="w-3/4">
            <CalendarClient />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
