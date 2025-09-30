import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedWithBookingZoneDto,
} from "mydive/server/api/routers/types";
import type { BookingRequestTableRow } from "./table";
import { useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import {
  isBookingWindowPopulatedDto,
  isWaitlistEntryPopulatedDto,
} from "mydive/app/_shared-types/type-validation";
import { formatDateShort } from "mydive/app/_shared-frontend/utils/booking";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  UsersIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { getBookingStatusIcon } from "mydive/app/_shared-frontend/components/statusIcons";
import { BookingWindowActionsDropdown } from "./booking-window-actions-dropdown";
import { WaitlistEntryActionsDropdown } from "./waitlist-actions-dropdown";

export const MobileBookingCard = ({
  tableRow,
  handleBookingWindowCancellationClick,
  handleWaitlistEntryCancellationClick,
}: {
  tableRow: BookingRequestTableRow;
  handleBookingWindowCancellationClick: (
    booking: BookingWindowPopulatedDto,
  ) => void;
  handleWaitlistEntryCancellationClick: (
    waitlistEntry: WaitlistEntryPopulatedWithBookingZoneDto,
  ) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAwaitingDeposit = tableRow.status === "PENDING_DEPOSIT";

  return (
    <Card
      className={`mb-3 transition-all duration-300 ${
        isAwaitingDeposit
          ? "border-2 border-dashed border-slate-300 bg-gradient-to-br from-amber-50/50 to-white opacity-75 shadow-sm hover:opacity-100 hover:shadow-lg"
          : "shadow-sm hover:shadow-md"
      }`}
    >
      <CardBody className="p-0">
        {/* Compact Header - Always Visible */}
        <div
          className={`flex cursor-pointer items-center justify-between p-4 ${
            isAwaitingDeposit ? "bg-amber-50/30" : ""
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Left side - Date and Type */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Date */}
              <div
                className={`text-base font-semibold ${
                  isAwaitingDeposit ? "text-slate-600" : "text-slate-800"
                }`}
              >
                {isBookingWindowPopulatedDto(tableRow.data)
                  ? `${formatDateShort(tableRow.data.windowStartDate)} - ${formatDateShort(tableRow.data.windowEndDate)}`
                  : formatDateShort(tableRow.data.waitlist.day)}
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    isBookingWindowPopulatedDto(tableRow.data)
                      ? isAwaitingDeposit
                        ? "border border-blue-200 bg-blue-50 text-blue-600 opacity-70"
                        : "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  <CalendarIcon className="h-3 w-3" />
                  {isBookingWindowPopulatedDto(tableRow.data)
                    ? "Window"
                    : "Waitlist"}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Status, Actions, and Expand Icon */}
          <div className="ml-4 flex items-center gap-2">
            {/* Status */}
            {getBookingStatusIcon(tableRow.status)}
            {/* Actions Dropdown */}
            {!(tableRow.status === "CANCELED") && (
              <div onClick={(e) => e.stopPropagation()}>
                {isBookingWindowPopulatedDto(tableRow.data) ? (
                  <BookingWindowActionsDropdown
                    booking={tableRow.data}
                    onCancel={() =>
                      handleBookingWindowCancellationClick(
                        tableRow.data as BookingWindowPopulatedDto,
                      )
                    }
                  />
                ) : isWaitlistEntryPopulatedDto(tableRow.data) ? (
                  <WaitlistEntryActionsDropdown
                    waitlistEntry={tableRow.data}
                    onCancel={() =>
                      handleWaitlistEntryCancellationClick(
                        tableRow.data as WaitlistEntryPopulatedWithBookingZoneDto,
                      )
                    }
                  />
                ) : null}
              </div>
            )}

            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div
            className={`space-y-3 border-t border-slate-100 p-4 ${
              isAwaitingDeposit
                ? "bg-gradient-to-b from-amber-50/20 to-transparent"
                : ""
            }`}
          >
            {isAwaitingDeposit && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <div className="text-sm font-semibold text-amber-900">
                      Complete Your Booking
                    </div>
                    <div className="mt-1 text-xs text-amber-700">
                      Submit your deposit to secure this booking window
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${
                  isAwaitingDeposit
                    ? "border border-purple-100 bg-purple-50/60 text-purple-600"
                    : "bg-purple-50 text-purple-700"
                }`}
              >
                <span className="font-semibold">
                  {tableRow.data.bookingZone}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Drop Zone</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Jumpers */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${
                    isAwaitingDeposit
                      ? "border border-purple-100 bg-purple-50/60 text-purple-600"
                      : "bg-purple-50 text-purple-700"
                  }`}
                >
                  <UsersIcon className="h-4 w-4" />
                  <span className="font-semibold">{tableRow.numJumpers}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">Jumpers</div>
              </div>
              {/* Position for waitlist */}
              {isWaitlistEntryPopulatedDto(tableRow.data) &&
                tableRow.data.activePosition && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-purple-700">
                      <span>#{tableRow.data.activePosition}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Position on Waitlist
                    </div>
                  </div>
                )}
              {/* Requested Date */}
              {isBookingWindowPopulatedDto(tableRow.data) && (
                <div className="text-center">
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isAwaitingDeposit
                        ? "border border-blue-100 bg-blue-50/60 text-blue-600"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      {formatDateShort(tableRow.requestedJumpDate)}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Preferred</div>
                </div>
              )}
              {/* Scheduled Dates */}
              <div className="col-span-2">
                <div className="mb-2 text-center text-xs text-slate-500">
                  Scheduled Jump Dates
                </div>
                {tableRow.scheduledJumpDates.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {tableRow.scheduledJumpDates.map((jumpDay, idx) => (
                      <div
                        key={`${idx}-${jumpDay.toISOString()}`}
                        className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-sm text-green-700"
                      >
                        <CheckCircleIcon className="h-3 w-3" />
                        <span className="font-medium">
                          {formatDateShort(jumpDay)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-sm">Pending confirmation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
