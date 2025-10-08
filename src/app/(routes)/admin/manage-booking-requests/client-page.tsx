"use client";
import React, { useMemo } from "react";
import type {
  BookingWindowPopulatedDto,
  ScheduledJumpDto,
  UserDto,
  WaitlistPopulatedDto,
} from "mydive/server/api/routers/types";
import { calculateAdminBookingRequestsStats } from "mydive/app/_shared-frontend/utils/stats";
import BookingRequestsStatsCards from "mydive/app/(routes)/admin/manage-booking-requests/components/admin-booking-requests-stats-cards";
import AdminBookingRequestsTable from "./components/booking-requests-table/table";
import _ from "lodash";

export default function AdminBookingRequestsClient({
  loadedBookingWindows,
  loadedUsers,
  loadedWaitlists,
  loadedScheduledJumps,
  adminUser,
}: {
  loadedBookingWindows: BookingWindowPopulatedDto[];
  loadedUsers: UserDto[];
  loadedWaitlists: WaitlistPopulatedDto[];
  loadedScheduledJumps: ScheduledJumpDto[];
  adminUser: UserDto;
}) {
  const stats = useMemo(() => {
    return calculateAdminBookingRequestsStats(
      loadedBookingWindows,
      loadedWaitlists,
    ); // for now, not sure what we want to do with this info.
  }, [loadedBookingWindows, loadedWaitlists]);

  return (
    <div
      className="flex flex-col space-y-5"
      style={{ height: "calc(100vh - 250px)" }} // I don't love this but it works
    >
      <BookingRequestsStatsCards stats={stats} />
      <div className="flex h-full max-h-full flex-1 flex-col overflow-hidden bg-white/95 p-0 shadow-2xl backdrop-blur-sm">
        <AdminBookingRequestsTable
          bookingWindows={loadedBookingWindows}
          users={loadedUsers}
          waitlists={loadedWaitlists}
          scheduledJumps={loadedScheduledJumps}
          adminUser={adminUser}
        />
      </div>
    </div>
  );
}
