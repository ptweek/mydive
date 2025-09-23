"use client";

import type { ScheduledJump } from "@prisma/client";
import ScheduledJumpsStatsCards from "mydive/app/_shared-frontend/components/cards/scheduled-jumps-stats-cards";
import { computeScheduledJumpStats } from "mydive/app/_shared-frontend/utils/stats";
import type { UserDto } from "mydive/server/api/routers/types";
import { useMemo } from "react";
import ScheduledJumpsTable from "mydive/app/_shared-frontend/components/tables/scheduled-jump/table";
import { Card, CardBody } from "@nextui-org/react";

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Scheduled Jumps Manager
          </h1>
          <p className="text-gray-600">
            {`See all of your scheduled jumps in one place`}
          </p>
        </div>
        {/* Main Content */}
        <ScheduledJumpsStatsCards stats={stats} />
        <Card className="shadow-2xl">
          <CardBody className="bg-white p-0">
            <ScheduledJumpsTable
              scheduledJumps={scheduledJumps}
              users={users}
              isAdminView={true}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
