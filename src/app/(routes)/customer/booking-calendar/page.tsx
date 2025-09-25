import { HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalendarClientPage from "./client-page";

export default async function CalendarPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <HydrateClient>
      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-2 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <CalendarClientPage userId={user.id} />
      </div>
    </HydrateClient>
  );
}
