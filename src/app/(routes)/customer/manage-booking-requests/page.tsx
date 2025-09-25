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
      <main className="relative flex h-screen flex-col overflow-hidden text-white">
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
        <div className="relative z-10 mx-auto w-full max-w-7xl px-2 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
          <ManageBookingRequestsClient
            loadedBookingWindows={bookingWindows}
            loadedWaitlistEntries={waitlistEntries}
          />
        </div>
      </main>
    </HydrateClient>
  );
}
