import { api, HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminBookingsClient from "./client-page";
import { clerkUserToDto } from "mydive/server/api/routers/adminBookingManager";

export default async function AdminManageBookingRequestsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const adminUserDto = clerkUserToDto(user);
  const { bookingWindows, waitlists, scheduledJumps, users } =
    await api.adminBookingManager.getBookingReservationData();
  return (
    <HydrateClient>
      <AdminBookingsClient
        loadedBookingWindows={bookingWindows}
        loadedWaitlists={waitlists}
        loadedScheduledJumps={scheduledJumps}
        loadedUsers={users}
        adminUser={adminUserDto}
      />
    </HydrateClient>
  );
}
