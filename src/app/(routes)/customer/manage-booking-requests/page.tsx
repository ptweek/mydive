import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ManageBookingRequestsClient from "./client-page";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

export default async function ManageBookingsRequestsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const { bookingWindows, waitlistEntries } =
    await api.customerBookingManager.getBookingRequestsByUser({
      bookedBy: user.id,
    });
  return (
    <HydrateClient>
      <div
        className="mx-auto grid w-[90%] grid-rows-[auto_1fr] gap-3 sm:w-3/4"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <PageHeader
          title={"Booking Requests Manager"}
          description={"Manage and track all your requests"}
        />
        <ManageBookingRequestsClient
          loadedBookingWindows={bookingWindows}
          loadedWaitlistEntries={waitlistEntries}
        />
      </div>
    </HydrateClient>
  );
}
