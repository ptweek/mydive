import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BookingsClient from "./components/bookings-client";

export default async function MyBookingsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const { bookings } = await api.booking.getBookingsByUser({
    bookedBy: user.id,
  });
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
        <BookingsClient loadedBookings={bookings} />
      </main>
    </HydrateClient>
  );
}
