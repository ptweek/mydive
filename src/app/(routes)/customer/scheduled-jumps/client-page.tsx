"use client";

import type { ScheduledJump } from "@prisma/client";
import ScheduledJumpsStatsCards from "mydive/app/_shared-frontend/components/cards/scheduled-jumps-stats-cards";
import { computeScheduledJumpStats } from "mydive/app/_shared-frontend/utils/stats";
import { useMemo } from "react";
import ScheduledJumpsTable from "mydive/app/_shared-frontend/components/tables/scheduled-jump/table";
import { Card, CardBody } from "@nextui-org/react";

export default function CustomerScheduledJumpsClientPage({
  scheduledJumps,
}: {
  scheduledJumps: ScheduledJump[];
}) {
  const stats = useMemo(() => {
    return computeScheduledJumpStats(scheduledJumps);
  }, [scheduledJumps]);

  return (
    <div
      className="flex flex-col space-y-5"
      style={{ height: "calc(100vh - 200px)" }} // I don't love this but it works
    >
      <ScheduledJumpsStatsCards stats={stats} />
      <div className="flex h-full max-h-full flex-1 flex-col overflow-auto bg-white/95 p-0 shadow-2xl backdrop-blur-sm">
        <ScheduledJumpsTable
          scheduledJumps={scheduledJumps}
          isAdminView={false}
        />
      </div>
    </div>
  );
}
