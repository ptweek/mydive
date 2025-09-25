"use client";

import type { ScheduledJump } from "@prisma/client";
import ScheduledJumpsStatsCards from "mydive/app/_shared-frontend/components/cards/scheduled-jumps-stats-cards";
import { computeScheduledJumpStats } from "mydive/app/_shared-frontend/utils/stats";
import type { UserDto } from "mydive/server/api/routers/types";
import { useMemo } from "react";
import ScheduledJumpsTable from "mydive/app/_shared-frontend/components/tables/scheduled-jump/table";
import { Card, CardBody } from "@nextui-org/react";
import PageHeader from "mydive/app/_shared-frontend/components/headers/PageHeader";

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
  return (
    <div className="z-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Scheduled Jumps Manager"
          description="See all of your scheduled jumps in one place"
        />
        {/* Main Content */}
        <ScheduledJumpsStatsCards stats={stats} />

        <div className="mb-[5px] min-h-0 flex-1">
          <Card className="h-full bg-white/95 shadow-2xl backdrop-blur-sm">
            <CardBody className="flex h-full flex-col p-0">
              <div className="min-h-0 flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                  <ScheduledJumpsTable
                    scheduledJumps={scheduledJumps}
                    users={users}
                    isAdminView={true}
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
