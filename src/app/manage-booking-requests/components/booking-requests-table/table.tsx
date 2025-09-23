import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { formatDateShort } from "mydive/app/_utils/booking";
import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedDto,
} from "mydive/server/api/routers/types";
import { BookingWindowActionsDropdown } from "./booking-window-actions-dropdown";
import type { BookingStatus } from "@prisma/client";
import {
  isBookingWindowPopulatedDto,
  isWaitlistEntryPopulatedDto,
} from "../../_utils/table";
import { WaitlistEntryActionsDropdown } from "./waitlist-actions-dropdown";
import { getBookingStatusIcon } from "mydive/app/_components/statusIcons";

export type BookingRequestTableRow = {
  type: "BOOKING_WINDOW" | "WAITLIST_ENTRY";
  id: number;
  bookingWindowDates?: { start: Date; end: Date }; // exists if BOOKING_WINDOW type
  waitlistDate?: Date; // exists if WAITLIST type
  position?: number; // exists only on waitlist type
  status: BookingStatus;
  numJumpers: number;
  requestedJumpDate: Date;
  scheduledJumpDates: Date[]; // Should only provide the ACTIVE scheduled jump date
  createdAt: Date;
  data: BookingWindowPopulatedDto | WaitlistEntryPopulatedDto;
};

const BookingWindowRequestSummaryInfo = ({
  start,
  end,
}: {
  start: Date;
  end: Date;
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="mt-2 ml-5">
        <div className="text-sm font-semibold text-slate-700">
          {formatDateShort(start)} - {formatDateShort(end)}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <CalendarIcon className="h-3 w-3" />
          3-day booking window
        </div>
      </div>
    </div>
  );
};
const WailistRequestSummaryInfo = ({ date }: { date: Date }) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="mt-2 ml-5">
        <div className="text-sm font-semibold text-slate-700">
          {formatDateShort(date)}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <CalendarIcon className="h-3 w-3" />
          Waitlist
        </div>
      </div>
    </div>
  );
};

export default function BookingRequestsTable({
  tableData,
  handleBookingWindowCancellationClick,
  handleWaitlistEntryCancellationClick,
}: {
  tableData: BookingRequestTableRow[];
  handleBookingWindowCancellationClick: (
    booking: BookingWindowPopulatedDto,
  ) => void;
  handleWaitlistEntryCancellationClick: (
    waitlistEntry: WaitlistEntryPopulatedDto,
  ) => void;
}) {
  return (
    <Table
      aria-label="Booking Requests Table"
      removeWrapper
      classNames={{
        base: "min-h-0",
        wrapper: "p-0 shadow-none bg-transparent",
        table: "min-h-0",
        thead: "bg-transparent",
        tbody: "bg-transparent",
        th: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b-2 border-slate-200 py-4 sticky top-0 z-10",
        td: "py-4 px-6 border-b border-slate-100",
        tr: "hover:bg-slate-50/50 transition-colors duration-200",
      }}
    >
      <TableHeader>
        <TableColumn className="text-left">BOOKING REQUEST</TableColumn>
        <TableColumn className="text-center">STATUS</TableColumn>
        <TableColumn className="text-center">POSITION</TableColumn>
        <TableColumn className="text-center">JUMPERS</TableColumn>
        <TableColumn className="text-center">REQUESTED JUMP DATE</TableColumn>
        <TableColumn className="text-center">SCHEDULED JUMP DATES</TableColumn>
        <TableColumn className="text-center">DATE BOOKED</TableColumn>
        <TableColumn className="text-center">ACTIONS</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No bookings found">
        {tableData.map((tableRow) => {
          return (
            <TableRow key={`${tableRow.id}-${tableRow.type}`} className="group">
              <TableCell>
                {isBookingWindowPopulatedDto(tableRow.data) ? (
                  <BookingWindowRequestSummaryInfo
                    start={tableRow.data.windowStartDate}
                    end={tableRow.data.windowEndDate}
                  />
                ) : (
                  <WailistRequestSummaryInfo
                    date={tableRow.data.waitlist.day}
                  />
                )}
              </TableCell>

              <TableCell>{getBookingStatusIcon(tableRow.status)}</TableCell>

              <TableCell>
                <div className="flex justify-center text-black">
                  {isWaitlistEntryPopulatedDto(tableRow.data) &&
                  tableRow.data.activePosition
                    ? `${tableRow.data.activePosition}`
                    : `--`}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center">
                  <div className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-3">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-lg font-bold text-purple-800">
                        {tableRow.numJumpers}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-center">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                    <div className="text-sm font-semibold text-blue-900">
                      {formatDateShort(tableRow.requestedJumpDate)}
                    </div>
                    <div className="text-xs text-blue-600">Preferred</div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-center">
                  {tableRow.scheduledJumpDates.length > 0 ? (
                    <div className="space-y-1">
                      {tableRow.scheduledJumpDates.map((jumpDay, idx) => (
                        <div
                          key={`${idx}-${jumpDay.toISOString()}`}
                          className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-sm"
                        >
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            {formatDateShort(jumpDay)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">
                          Pending
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Awaiting confirmation
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-700">
                      {formatDateShort(tableRow.createdAt)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(tableRow.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                        },
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {!(tableRow.status === "CANCELED") &&
                isBookingWindowPopulatedDto(tableRow.data) ? (
                  (() => {
                    const bookingData = tableRow.data; // TypeScript now knows this is BookingWindowPopulatedDto
                    return (
                      <div className="flex justify-center">
                        <BookingWindowActionsDropdown
                          booking={bookingData}
                          onCancel={() =>
                            handleBookingWindowCancellationClick(bookingData)
                          }
                        />
                      </div>
                    );
                  })()
                ) : isWaitlistEntryPopulatedDto(tableRow.data) ? (
                  (() => {
                    const waitlistEntry = tableRow.data; // TypeScript now knows this is BookingWindowPopulatedDto
                    return (
                      <div className="flex justify-center">
                        <WaitlistEntryActionsDropdown
                          waitlistEntry={waitlistEntry}
                          onCancel={() =>
                            handleWaitlistEntryCancellationClick(waitlistEntry)
                          }
                        />
                      </div>
                    );
                  })()
                ) : (
                  <div>--</div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
