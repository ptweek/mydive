import { CalendarIcon, UserIcon } from "@heroicons/react/24/outline";
import { Card, CardBody } from "@nextui-org/react";
import type { ScheduledJump } from "@prisma/client";
import { formatDateShort } from "mydive/app/_shared-frontend/utils/booking";
import type { UserDto } from "mydive/server/api/routers/types";
import { getScheduledJumpStatusIcon } from "../../statusIcons";
import {
  convertBookingZoneEnumToDisplayString,
  convertSchedulingMethodToDisplayString,
} from "mydive/app/_shared-types/defaults";
import { isDateInPast } from "mydive/app/(routes)/customer/booking-calendar/components/calendar/helpers";

// Mobile Card Component
export const MobileScheduledJumpCard = ({
  scheduledJump,
  user,
  isAdminView,
  handleJumpCancellationClick,
  handleContactInfoClick,
}: {
  scheduledJump: ScheduledJump;
  user?: UserDto;
  isAdminView: boolean;
  handleJumpCancellationClick: (scheduledJump: ScheduledJump) => void;
  handleContactInfoClick: (user: UserDto) => void;
  handleJumpCompletionClick: (scheduledJump: ScheduledJump) => void;
}) => {
  return (
    <Card className="mb-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardBody className="p-4">
        {/* Header with Date and Status */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="text-base font-semibold text-slate-800">
              {formatDateShort(scheduledJump.jumpDate)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <CalendarIcon className="h-4 w-4" />
              Jump Date
            </div>
          </div>

          <div className="ml-4 flex items-center gap-3">
            {getScheduledJumpStatusIcon(scheduledJump.status)}
          </div>
        </div>

        {/* Customer Info (Admin View Only) */}
        {isAdminView && user && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <button
                onClick={() => handleContactInfoClick(user)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Contact Info
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-600">{user.email}</div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          {/* Jump Type */}
          <div className="text-center">
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-purple-700">
              <div className="text-sm font-semibold capitalize">
                {convertBookingZoneEnumToDisplayString(
                  scheduledJump.bookingZone,
                )}
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500">Booking Zone</div>
          </div>

          {/* Created Date */}
          <div className="text-center">
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
              <div className="text-sm font-semibold">
                {convertSchedulingMethodToDisplayString(
                  scheduledJump.schedulingMethod,
                )}
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500">Scheduling Method</div>
          </div>
        </div>

        {/* Actions */}
        {!isAdminView &&
        scheduledJump.status === "SCHEDULED" &&
        !isDateInPast(scheduledJump.jumpDate) ? (
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => handleJumpCancellationClick(scheduledJump)}
              className={`${isAdminView ? "flex-1" : "w-full"} rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700`}
            >
              Cancel Jump
            </button>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};
