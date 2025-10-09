"use client";

import type { ScheduledJump } from "@prisma/client";
import ScheduledJumpsStatsCards from "mydive/app/_shared-frontend/components/cards/scheduled-jumps-stats-cards";
import { computeScheduledJumpStats } from "mydive/app/_shared-frontend/utils/stats";
import type { UserDto } from "mydive/server/api/routers/types";
import { useMemo, useState } from "react";
import ScheduledJumpsTable, {
  type PaginationProps,
} from "mydive/app/_shared-frontend/components/tables/scheduled-jump/table";
import { normalizeToUTCMidnight } from "mydive/server/utils/dates";

export default function AdminScheduledJumpsClient({
  scheduledJumps,
  users,
}: {
  scheduledJumps: ScheduledJump[];
  users: UserDto[];
}) {
  const stats = useMemo(() => {
    return computeScheduledJumpStats(scheduledJumps);
  }, [scheduledJumps]);

  const [currentDate, setCurrentDate] = useState(
    normalizeToUTCMidnight(new Date()),
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalBookings = 0;

  const paginationProps: PaginationProps = {
    currentDate,
    setCurrentDate,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalBookings,
  };
  return (
    <div
      className="flex flex-col space-y-5"
      style={{ height: "calc(100vh - 250px)" }} // I don't love this but it works
    >
      <ScheduledJumpsStatsCards stats={stats} />
      <div className="flex h-full max-h-full flex-1 flex-col overflow-auto bg-white/95 p-0 shadow-2xl backdrop-blur-sm">
        <ScheduledJumpsTable
          scheduledJumps={scheduledJumps}
          users={users}
          isAdminView={true}
          paginationProps={paginationProps}
        />
      </div>
    </div>
  );
}
