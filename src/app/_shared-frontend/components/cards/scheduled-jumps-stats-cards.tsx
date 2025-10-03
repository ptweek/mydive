import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Card, CardBody } from "@nextui-org/react";
import { useState } from "react";
import type { ScheduledJumpStats } from "../../utils/stats";

export default function ScheduledJumpsStatsCards({
  stats,
}: {
  stats: ScheduledJumpStats;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {/* Mobile Compact View */}
      <div className="block lg:hidden">
        <Card className="bg-white/95 shadow-lg backdrop-blur-sm">
          <CardBody className="p-4">
            {/* Summary Row */}
            <div
              className="flex cursor-pointer items-center justify-between"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {stats.scheduledJumps}
                  </div>
                  <div className="text-xs text-gray-600">Scheduled</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {stats.completedJumps}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {stats.canceledJumps > 0 && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {stats.canceledJumps}
                    </div>
                    <div className="text-xs text-gray-600">Canceled</div>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-200 pt-4">
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-100">Total Jumps</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <CalendarIcon className="h-6 w-6 text-blue-200" />
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-100">Scheduled</p>
                      <p className="text-xl font-bold">
                        {stats.scheduledJumps}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-6 w-6 text-green-200" />
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-100">Completed</p>
                      <p className="text-xl font-bold">
                        {stats.completedJumps}
                      </p>
                    </div>
                    <ClockIcon className="h-6 w-6 text-yellow-200" />
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-red-100">Canceled</p>
                      <p className="text-xl font-bold">{stats.canceledJumps}</p>
                    </div>
                    <XCircleIcon className="h-6 w-6 text-red-200" />
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Desktop Full View */}
      <div className="hidden grid-cols-5 gap-4 lg:grid">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-shadow duration-200 hover:shadow-xl">
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

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transition-shadow duration-200 hover:shadow-xl">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduledJumps}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg transition-shadow duration-200 hover:shadow-xl">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-100">Completed</p>
                <p className="text-2xl font-bold">{stats.completedJumps}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transition-shadow duration-200 hover:shadow-xl">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Canceled</p>
                <p className="text-2xl font-bold">{stats.canceledJumps}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-200" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
