import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminBookingsClient from "./components/admin-bookings-client";
import { clerkUserToDto } from "mydive/server/api/routers/adminBookingManager";

export default async function MyBookingsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const adminUserDto = clerkUserToDto(user);
  const { bookingWindows, waitlists, scheduledJumps, users } =
    await api.adminBookingManager.getBookingReservationData();
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

        {/* Content */}
        <AdminBookingsClient
          loadedBookingWindows={bookingWindows}
          loadedWaitlists={waitlists}
          loadedScheduledJumps={scheduledJumps}
          loadedUsers={users}
          adminUser={adminUserDto}
        />
      </main>
    </HydrateClient>
  );
}
