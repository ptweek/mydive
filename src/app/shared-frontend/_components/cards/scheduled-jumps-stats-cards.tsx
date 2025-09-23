import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Card, CardBody } from "@nextui-org/react";

export default function ScheduledJumpsStatsCards({
  stats,
}: {
  stats: {
    total: number;
    confirmedJumps: number;
    pendingJumps: number;
    completedJumps: number;
    cancelledJumps: number;
    totalJumpers: number;
    bookingWindowJumps: number;
    waitlistJumps: number;
  };
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Jumps</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-200" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmedJumps}</p>
              <p className="text-sm">
                {stats.bookingWindowJumps} booking window, {stats.waitlistJumps}{" "}
                waitlist
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-100">Pending Confirmation</p>
              <p className="text-2xl font-bold">{stats.pendingJumps}</p>
              <p className="text-sm">Awaiting admin approval</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-200" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-100">Cancelled</p>
              <p className="text-2xl font-bold">{stats.cancelledJumps}</p>
              <p className="text-sm">Cancelled jumps</p>
            </div>
            <ClockIcon className="h-8 w-8 text-red-200" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Completed</p>
              <p className="text-2xl font-bold">{stats.completedJumps}</p>
              <p className="text-sm">Successfully completed</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
