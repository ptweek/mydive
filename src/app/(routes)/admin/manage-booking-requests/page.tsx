import { HydrateClient } from "mydive/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminBookingsClient from "./client-page";
import { clerkUserToDto } from "mydive/server/api/routers/adminBookingManager";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

export default async function AdminManageBookingRequestsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const adminUserDto = clerkUserToDto(user);

  return (
    <HydrateClient>
      <div
        id="page-elements"
        className="mx-auto w-[90%] space-y-5 pt-2 sm:w-3/4"
        style={{ height: "calc(100vh - 150px)" }} // not an exact science.
      >
        <PageHeader
          title={"Admin Booking Requests Manager"}
          description={"Manage and track all your requests"}
        />
        <AdminBookingsClient adminUser={adminUserDto} />
      </div>
    </HydrateClient>
  );
}
