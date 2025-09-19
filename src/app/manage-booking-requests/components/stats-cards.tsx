import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Badge, Card, CardBody } from "@nextui-org/react";

export default function BookingRequestsStatsCards({
  stats,
}: {
  stats: {
    total: number;
    confirmed: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalJumpers: number;
  };
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Bookings</p>
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
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-100">
                Waiting Jump Confirmation
              </p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-200" />
          </div>
        </CardBody>
      </Card>
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-100">Canceled</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-200" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <Badge
              content={stats.totalJumpers}
              color="warning"
              className="text-xs"
            >
              <UsersIcon className="h-8 w-8 text-purple-200" />
            </Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
