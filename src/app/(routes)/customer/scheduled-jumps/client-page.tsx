"use client";

import type { ScheduledJump } from "@prisma/client";
import ScheduledJumpsStatsCards from "mydive/app/_shared-frontend/components/cards/scheduled-jumps-stats-cards";
import { computeScheduledJumpStats } from "mydive/app/_shared-frontend/utils/stats";
import { useMemo } from "react";
import ScheduledJumpsTable from "mydive/app/_shared-frontend/components/tables/scheduled-jump/table";
import { Card, CardBody } from "@nextui-org/react";
import PageHeader from "mydive/app/_shared-frontend/components/headers/ClientPageHeader";

export default function CustomerScheduledJumpsClientPage({
  scheduledJumps,
}: {
  scheduledJumps: ScheduledJump[];
}) {
  const stats = useMemo(() => {
    return computeScheduledJumpStats(scheduledJumps);
  }, [scheduledJumps]);

  return (
    <div className="relative z-10 w-full px-4 py-6 sm:p-6 md:p-8">
      <div className="mx-auto flex h-full max-w-7xl flex-col">
        {/* Header */}
        <PageHeader
          title={"Scheduled Jumps Manager"}
          description={"See all of your scheduled jumps in one place"}
        />

        {/* Stats Cards */}
        <div className="mb-6 flex-shrink-0 sm:mb-8">
          <ScheduledJumpsStatsCards stats={stats} />
        </div>

        {/* Table Card */}
        <div className="mb-[5px] min-h-0 flex-1">
          <Card className="h-full bg-white/95 shadow-2xl backdrop-blur-sm">
            <CardBody className="flex h-full flex-col p-0">
              <div className="min-h-0 flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                  <ScheduledJumpsTable
                    scheduledJumps={scheduledJumps}
                    isAdminView={false}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
