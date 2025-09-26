import { HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalendarClientPage from "./client-page";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

export default async function CalendarPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return (
    <HydrateClient>
      <div
        className="mx-auto grid w-[90%] grid-rows-[auto_1fr] gap-3 pt-2 sm:w-3/4"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <PageHeader
          title={"Booking Calendar"}
          description={
            "Book an isolated three day window, or hop on the waitlist."
          }
        />
        <div className="mb-5 min-h-0">
          <CalendarClientPage userId={user.id} />
        </div>
      </div>
    </HydrateClient>
  );
}
