"use client";

import ScheduledJumpsStatsCards from "mydive/app/_shared-frontend/components/cards/scheduled-jumps-stats-cards";
import { computeScheduledJumpStats } from "mydive/app/_shared-frontend/utils/stats";
import { useMemo, useState } from "react";
import ScheduledJumpsTable, {
  type PaginationProps,
} from "mydive/app/_shared-frontend/components/tables/scheduled-jump/table";
import { normalizeToUTCMidnight } from "mydive/server/utils/dates";
import { api } from "mydive/trpc/react";

export default function AdminScheduledJumpsClient() {
  const [currentDate, setCurrentDate] = useState(
    normalizeToUTCMidnight(new Date()),
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* Queries here*/
  const monthStart = normalizeToUTCMidnight(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );
  const monthEnd = normalizeToUTCMidnight(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
  );
  const { data: scheduledJumpsCount, isLoading: isCountLoading } =
    api.adminScheduledJumpsManager.getScheduledJumpsCount.useQuery(
      {
        jumpDate: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    );

  const { data, isLoading: isRowsLoading } =
    api.adminScheduledJumpsManager.getScheduledJumpsAndUsersPaginated.useQuery(
      {
        page,
        limit: rowsPerPage,
        jumpDate: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    );
  const scheduledJumps = data?.scheduledJumps;
  const users = data?.users;

  const stats = useMemo(() => {
    return computeScheduledJumpStats(scheduledJumps ?? []);
  }, [scheduledJumps]);

  const numPages = useMemo(() => {
    return scheduledJumpsCount
      ? Math.ceil(scheduledJumpsCount / rowsPerPage)
      : undefined;
  }, [scheduledJumpsCount, rowsPerPage]);

  const paginationProps: PaginationProps = {
    currentDate,
    setCurrentDate,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    numPages,
    totalBookings: scheduledJumpsCount,
    isLoading: isRowsLoading || isCountLoading,
  };
  return (
    <div
      className="flex flex-col space-y-5"
      style={{ height: "calc(100vh - 250px)" }} // I don't love this but it works
    >
      <ScheduledJumpsStatsCards stats={stats} />
      <div className="flex h-full max-h-full flex-1 flex-col overflow-hidden bg-white/95 p-0 shadow-2xl backdrop-blur-sm">
        <ScheduledJumpsTable
          scheduledJumps={scheduledJumps ?? []}
          users={users}
          isAdminView={true}
          paginationProps={paginationProps}
        />
      </div>
    </div>
  );
}
