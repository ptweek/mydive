import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ManageBookingRequestsClient from "./manage-booking-requests-client-page";

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
      <ManageBookingRequestsClient
        loadedBookingWindows={bookingWindows}
        loadedWaitlistEntries={waitlistEntries}
      />
    </HydrateClient>
  );
}
