import { HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalendarClientPage from "./client-page";
import PageHeader from "mydive/app/_shared-frontend/components/headers/ClientPageHeader";
export default async function CalendarPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return (
    <HydrateClient>
      <div className="mx-auto flex w-3/4 flex-col space-y-3">
        <PageHeader
          title={"Booking Calendar"}
          description={
            "Book an isolated three day window, or hop on the waitlist."
          }
        />
        <CalendarClientPage userId={user.id} />
      </div>
    </HydrateClient>
  );
}
