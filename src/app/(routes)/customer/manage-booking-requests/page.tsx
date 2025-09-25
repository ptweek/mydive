import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ManageBookingRequestsClient from "./manage-booking-requests-client-page";
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
      <div className="mx-auto mb-5 flex h-screen w-[90%] flex-col space-y-3 sm:w-3/4">
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
