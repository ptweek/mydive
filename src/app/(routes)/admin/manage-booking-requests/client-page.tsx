"use client";
import React, { useMemo, useState } from "react";
import type { UserDto } from "mydive/server/api/routers/types";
import { calculateAdminBookingRequestsStats } from "mydive/app/_shared-frontend/utils/stats";
import BookingRequestsStatsCards from "mydive/app/(routes)/admin/manage-booking-requests/components/admin-booking-requests-stats-cards";
import AdminBookingRequestsTable from "./components/booking-requests-table/table";
import { api } from "mydive/trpc/react";
import { normalizeToUTCMidnight } from "mydive/server/utils/dates";

export default function AdminBookingRequestsClient({
  adminUser,
}: {
  adminUser: UserDto;
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentDate, setCurrentDate] = useState(
    normalizeToUTCMidnight(new Date()),
  );

  /* might need to do this on the backend now */
  const stats = useMemo(() => {
    return calculateAdminBookingRequestsStats([], []);
  }, []);

  const { data: bookingsCount, isLoading: isLoadingBookingsCount } =
    api.adminBookingManager.getBookingsCount.useQuery(
      {
        windowStartDate: {
          gte: normalizeToUTCMidnight(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          ),
          lt: normalizeToUTCMidnight(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
          ),
        },
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    );

  const { data, isLoading } =
    api.adminBookingManager.getBookingReservationDataPaginated.useQuery(
      {
        page,
        limit: rowsPerPage,
        windowStartDate: {
          gte: normalizeToUTCMidnight(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          ),
          lt: normalizeToUTCMidnight(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
          ),
        },
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    );
  const numPages = useMemo(() => {
    return bookingsCount ? Math.ceil(bookingsCount / rowsPerPage) : undefined;
  }, [bookingsCount, rowsPerPage]);

  const {
    bookingWindows: loadedBookingWindows,
    users: loadedUsers,
    waitlists: loadedWaitlists,
    scheduledJumps: loadedScheduledJumps,
  } = data ?? {
    bookingWindows: [],
    users: [],
    waitlists: [],
    scheduledJumps: [],
  };

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
          isLoading={isLoading || isLoadingBookingsCount}
          totalBookings={bookingsCount}
          numPages={numPages}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
    </div>
  );
}
