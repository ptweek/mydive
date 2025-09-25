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
    <div className="flex h-full flex-col gap-3">
      <div className="flex-shrink-0">
        <ScheduledJumpsStatsCards stats={stats} />
      </div>
      <div className="mb-5 min-h-0 flex-1">
        <Card className="h-full bg-white/95 shadow-2xl backdrop-blur-sm">
          <CardBody className="flex h-full flex-col p-0">
            <div className="h-full min-h-0 flex-1 overflow-auto">
              <ScheduledJumpsTable
                scheduledJumps={scheduledJumps}
                isAdminView={false}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
