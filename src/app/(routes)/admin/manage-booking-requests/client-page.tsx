"use client";
import React, { useMemo } from "react";
import { Card, CardBody } from "@nextui-org/react";
import type {
  BookingWindowPopulatedDto,
  ScheduledJumpDto,
  UserDto,
  WaitlistPopulatedDto,
} from "mydive/server/api/routers/types";
import { calculateBookingRequestsStats } from "mydive/app/_shared-frontend/utils/stats";
import BookingRequestsStatsCards from "mydive/app/_shared-frontend/components/cards/booking-requests-stats-cards";
import AdminBookingRequestsTable from "./components/booking-requests-table/table";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

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
    return calculateBookingRequestsStats(loadedBookingWindows, []); // for now, not sure what we want to do with this info.
  }, [loadedBookingWindows]);

  return (
    <div className="z-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <PageHeader
          title={"Admin Booking Requests Manager"}
          description={"Manage and track all your requests"}
        />
        {/* Stats Cards: TO DO! */}
        <BookingRequestsStatsCards stats={stats} />
        {/* Main Content */}
        <Card className="shadow-2xl">
          <CardBody className="bg-white p-0">
            {/* Fixed Height Table Container with Scroll */}
            <div className="max-h-[400px] overflow-auto">
              <AdminBookingRequestsTable
                bookingWindows={loadedBookingWindows}
                users={loadedUsers}
                waitlists={loadedWaitlists}
                scheduledJumps={loadedScheduledJumps}
                adminUser={adminUser}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
