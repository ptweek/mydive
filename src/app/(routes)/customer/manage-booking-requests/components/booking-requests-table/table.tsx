import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import {
  formatDateShort,
  getActiveScheduledJumpDatesFromBookingWindow,
} from "mydive/app/_shared-frontend/utils/booking";
import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedWithBookingZoneDto,
} from "mydive/server/api/routers/types";
import { BookingWindowActionsDropdown } from "./booking-window-actions-dropdown";
import type { BookingStatus } from "@prisma/client";
import {
  isBookingWindowPopulatedDto,
  isWaitlistEntryPopulatedDto,
} from "mydive/app/_shared-types/type-validation";
import { WaitlistEntryActionsDropdown } from "./waitlist-actions-dropdown";
import { getBookingStatusIcon } from "mydive/app/_shared-frontend/components/statusIcons";
import { useMemo, useState } from "react";
import BookingRequestsTableFilters from "mydive/app/_shared-frontend/components/tables/manage-booking-requests/filters";
import { MobileBookingCard } from "./mobile-booking-card";

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
  data: BookingWindowPopulatedDto | WaitlistEntryPopulatedWithBookingZoneDto;
};

const BookingWindowRequestSummaryInfo = ({
  start,
  end,
  isAwaitingDeposit,
}: {
  start: Date;
  end: Date;
  isAwaitingDeposit?: boolean;
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="mt-2 ml-2 sm:ml-5">
        <div
          className={`text-sm font-semibold ${
            isAwaitingDeposit ? "text-slate-600" : "text-slate-700"
          }`}
        >
          {formatDateShort(start)} - {formatDateShort(end)}
        </div>
        <div
          className={`mt-1 flex items-center gap-1 text-xs ${
            isAwaitingDeposit ? "text-slate-400" : "text-slate-500"
          }`}
        >
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
      <div className="mt-2 ml-2 sm:ml-5">
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
  bookingWindows,
  waitlistEntries,
  handleBookingWindowCancellationClick,
  handleWaitlistEntryCancellationClick,
}: {
  bookingWindows: BookingWindowPopulatedDto[];
  waitlistEntries: WaitlistEntryPopulatedWithBookingZoneDto[];
  handleBookingWindowCancellationClick: (
    booking: BookingWindowPopulatedDto,
  ) => void;
  handleWaitlistEntryCancellationClick: (
    waitlistEntry: WaitlistEntryPopulatedWithBookingZoneDto,
  ) => void;
}) {
  const [showPendingDeposit, setShowPendingDeposit] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const formattedTableData = useMemo(() => {
    const formattedBookingWindowsData: BookingRequestTableRow[] =
      bookingWindows.map((bookingWindow) => {
        const { id, status, numJumpers, createdAt, bookingZone } =
          bookingWindow;
        return {
          type: "BOOKING_WINDOW",
          id,
          status,
          numJumpers,
          bookingZone,
          createdAt,
          bookingWindowDates: {
            start: bookingWindow.windowStartDate,
            end: bookingWindow.windowEndDate,
          },
          requestedJumpDate: bookingWindow.idealizedJumpDate,
          scheduledJumpDates:
            getActiveScheduledJumpDatesFromBookingWindow(bookingWindow),
          data: bookingWindow,
        };
      });

    const formattedWaitlistEntries: BookingRequestTableRow[] =
      //For now only display active ones
      waitlistEntries
        .filter((waitlistEntry) => {
          return waitlistEntry.status;
        })
        .map((waitlistEntry) => {
          const { id, status, createdAt, activePosition, bookingZone } =
            waitlistEntry;
          return {
            type: "WAITLIST_ENTRY",
            id,
            status,
            numJumpers: 1,
            activePosition,
            bookingZone,
            createdAt,
            requestedJumpDate: waitlistEntry.waitlist.day,
            scheduledJumpDates:
              waitlistEntry.status === "SCHEDULED"
                ? [waitlistEntry.waitlist.day]
                : [],
            data: waitlistEntry,
          };
        });

    const tableData: BookingRequestTableRow[] = [
      ...formattedBookingWindowsData,
      ...formattedWaitlistEntries,
    ];
    return tableData;
  }, [bookingWindows, waitlistEntries]);

  const filteredBookings = useMemo(() => {
    let filtered = formattedTableData;

    if (!showPendingDeposit) {
      filtered = filtered.filter(
        (booking) => booking.status !== "PENDING_DEPOSIT",
      );
    }
    if (!showCancelled) {
      filtered = filtered.filter((booking) => booking.status !== "CANCELED");
    }
    if (!showPast) {
      filtered = filtered.filter((tableRow) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today

        if (tableRow.type === "BOOKING_WINDOW") {
          if (isBookingWindowPopulatedDto(tableRow.data)) {
            const bookingWindow = tableRow.data;
            const windowEndDate = new Date(bookingWindow.windowEndDate);
            windowEndDate.setHours(0, 0, 0, 0); // Set to start of that day
            return windowEndDate >= today;
          } else {
            throw new Error("Issue with booking window");
          }
        } else {
          if (isWaitlistEntryPopulatedDto(tableRow.data)) {
            const waitlistEntryWaitlist = tableRow.data.waitlist;
            const day = new Date(waitlistEntryWaitlist.day);
            day.setHours(0, 0, 0, 0); // Set to start of that day
            return day >= today;
          } else {
            throw new Error("Issue with waitlist entry");
          }
        }
      });
    }
    // sort filtered by startDate
    filtered.sort((a, b) => {
      let dateA;
      let dateB;

      if (isBookingWindowPopulatedDto(a.data)) {
        const bookingWindow = a.data;
        dateA = bookingWindow.windowStartDate;
      } else {
        const waitlistEntry = a.data;
        dateA = waitlistEntry.waitlist.day;
      }
      if (isBookingWindowPopulatedDto(b.data)) {
        const bookingWindow = b.data;
        dateB = bookingWindow.windowStartDate;
      } else {
        const waitlistEntry = b.data;
        dateB = waitlistEntry.waitlist.day;
      }
      return dateA.getTime() - dateB.getTime();
    });
    return filtered;
  }, [formattedTableData, showCancelled, showPast, showPendingDeposit]);

  if (filteredBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarIcon className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No booking requests found
        </h3>
        <p className="text-gray-500">
          Your booking requests will appear here when you make them.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 flex-shrink-0 overflow-hidden border-b border-slate-200 bg-white">
        <BookingRequestsTableFilters
          numVisibleRows={filteredBookings.length}
          showCancelled={showCancelled}
          setShowCancelled={setShowCancelled}
          showPast={showPast}
          setShowPast={setShowPast}
          showPendingDeposit={showPendingDeposit}
          setShowPendingDeposit={setShowPendingDeposit}
        />
      </div>
      {/* Mobile View - Cards */}
      <div className="block p-4 md:hidden">
        {filteredBookings.map((tableRow) => (
          <MobileBookingCard
            key={`${tableRow.id}-${tableRow.type}`}
            tableRow={tableRow}
            handleBookingWindowCancellationClick={
              handleBookingWindowCancellationClick
            }
            handleWaitlistEntryCancellationClick={
              handleWaitlistEntryCancellationClick
            }
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
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
            <TableColumn className="text-center">
              REQUESTED JUMP DATE
            </TableColumn>
            <TableColumn className="text-center">
              SCHEDULED JUMP DATES
            </TableColumn>
            <TableColumn className="text-center">DATE BOOKED</TableColumn>
            <TableColumn className="text-center">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No bookings found">
            {filteredBookings.map((tableRow) => {
              const isAwaitingDeposit = tableRow.status === "PENDING_DEPOSIT";

              return (
                <TableRow
                  key={`${tableRow.id}-${tableRow.type}`}
                  className={`group transition-all duration-200 ${
                    isAwaitingDeposit
                      ? "border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/30 to-transparent opacity-75"
                      : ""
                  }`}
                >
                  <TableCell>
                    <div className="relative">
                      {isAwaitingDeposit && (
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2">
                          <ExclamationCircleIcon className="h-5 w-5 text-amber-500" />
                        </div>
                      )}
                      {isBookingWindowPopulatedDto(tableRow.data) ? (
                        <BookingWindowRequestSummaryInfo
                          start={tableRow.data.windowStartDate}
                          end={tableRow.data.windowEndDate}
                          isAwaitingDeposit={isAwaitingDeposit}
                        />
                      ) : (
                        <WailistRequestSummaryInfo
                          date={tableRow.data.waitlist.day}
                        />
                      )}
                    </div>
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
                      <div
                        className={`rounded-full border p-3 ${
                          isAwaitingDeposit
                            ? "border-purple-100 bg-gradient-to-r from-purple-50/60 to-pink-50/60 opacity-80"
                            : "border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UsersIcon
                            className={`h-4 w-4 ${
                              isAwaitingDeposit
                                ? "text-purple-500"
                                : "text-purple-600"
                            }`}
                          />
                          <span
                            className={`text-lg font-bold ${
                              isAwaitingDeposit
                                ? "text-purple-700"
                                : "text-purple-800"
                            }`}
                          >
                            {tableRow.numJumpers}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center">
                      <div
                        className={`rounded-lg border px-3 py-2 text-center ${
                          isAwaitingDeposit
                            ? "border-blue-100 bg-blue-50/60"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div
                          className={`text-sm font-semibold ${
                            isAwaitingDeposit
                              ? "text-blue-800"
                              : "text-blue-900"
                          }`}
                        >
                          {formatDateShort(tableRow.requestedJumpDate)}
                        </div>
                        <div
                          className={`text-xs ${
                            isAwaitingDeposit
                              ? "text-blue-500"
                              : "text-blue-600"
                          }`}
                        >
                          Preferred
                        </div>
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
                        <div
                          className={`rounded-lg border px-3 py-2 text-center ${
                            isAwaitingDeposit
                              ? "border-gray-200 bg-gray-50"
                              : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {!isAwaitingDeposit ? (
                              <ClockIcon className={`h-4 w-4 text-amber-500`} />
                            ) : (
                              <ExclamationCircleIcon
                                className={`h-4 w-4 text-gray-500`}
                              />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                isAwaitingDeposit
                                  ? "text-gray-500"
                                  : "text-amber-700"
                              }`}
                            >
                              {isAwaitingDeposit
                                ? "Awaiting deposit"
                                : "Pending"}
                            </span>
                          </div>
                          <div
                            className={`mt-1 text-xs ${
                              isAwaitingDeposit
                                ? "text-gray-400"
                                : "text-amber-600"
                            }`}
                          >
                            {isAwaitingDeposit
                              ? "Must submit deposit"
                              : "Awaiting jump day confirmation"}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center">
                      <div className="text-center">
                        <div
                          className={`text-sm font-medium ${
                            isAwaitingDeposit
                              ? "text-slate-600"
                              : "text-slate-700"
                          }`}
                        >
                          {formatDateShort(tableRow.createdAt)}
                        </div>
                        <div
                          className={`text-xs ${
                            isAwaitingDeposit
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
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
                        const bookingData = tableRow.data;
                        return (
                          <div className="flex justify-center">
                            <BookingWindowActionsDropdown
                              booking={bookingData}
                              onCancel={() =>
                                handleBookingWindowCancellationClick(
                                  bookingData,
                                )
                              }
                            />
                          </div>
                        );
                      })()
                    ) : isWaitlistEntryPopulatedDto(tableRow.data) ? (
                      (() => {
                        const waitlistEntry = tableRow.data;
                        return (
                          <div className="flex justify-center">
                            <WaitlistEntryActionsDropdown
                              waitlistEntry={waitlistEntry}
                              onCancel={() =>
                                handleWaitlistEntryCancellationClick(
                                  waitlistEntry,
                                )
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
      </div>
    </>
  );
}
