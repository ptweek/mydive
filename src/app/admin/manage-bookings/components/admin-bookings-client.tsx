"use client";
import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
} from "@nextui-org/react";
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import { BookingActionsDropdown } from "./booking-actions-dropdown";
import { api } from "mydive/trpc/react";
import type {
  BookingWindowDto,
  ScheduledJumpDto,
  UserDto,
  WaitlistPopulatedDto,
} from "mydive/server/api/routers/types";
import { CancelConfirmationModal } from "./cancel-confirmation-modal";
import { ContactModal } from "./contact-modal";
import { ConfirmBookingDatesModal } from "./confirm-booking-date-modal";
import type { Waitlist, WaitlistEntry, WaitlistStatus } from "@prisma/client";
import AdminWaitlistModal from "./admin-waitlist-modal";
import { getActiveScheduledJumpDates } from "mydive/app/_utils/booking";

export interface WaitlistEntryWithUser extends WaitlistEntry {
  user?: UserDto; // Optional in case user lookup fails
}

export interface WaitlistWithUsers extends Omit<Waitlist, "entries"> {
  entries: WaitlistEntryWithUser[];
}

export interface BookingWindowWithUser extends BookingWindowDto {
  bookedByUser?: UserDto; // Optional in case user lookup fails
}

// Formatted table data structure
export interface BookingTableRow extends BookingWindowWithUser {
  waitlists: WaitlistWithUsers[];
  scheduledJumps: ScheduledJumpDto[];
}

export type BookingTableData = BookingTableRow[];

export default function AdminBookingsClient({
  loadedBookingWindows,
  loadedUsers,
  loadedWaitlists,
  loadedScheduledJumps,
  adminUserId,
}: {
  loadedBookingWindows: BookingWindowDto[];
  loadedUsers: UserDto[];
  loadedWaitlists: WaitlistPopulatedDto[];
  loadedScheduledJumps: ScheduledJumpDto[];
  adminUserId: string;
}) {
  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [bookingWindows, setBookingWindows] = useState<BookingWindowDto[]>(
    loadedBookingWindows ?? [],
  );
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [confirmBookingDateModalOpen, setConfirmBookingDateModalOpen] =
    useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [selectedWaitlist, setSelectedWaitlist] =
    useState<WaitlistWithUsers | null>(null);

  const [selectedBookingTableRow, setSelectedBookingTableRow] =
    useState<BookingTableRow | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const formatDateShort = (date: Date) => {
    return moment(date).format("MMM DD YYYY");
  };

  const stats = useMemo(() => {
    const total = bookingWindows.length;
    const confirmed = bookingWindows.filter(
      (b) => b.status === "CONFIRMED",
    ).length;
    const cancelled = bookingWindows.filter(
      (b) => b.status === "CANCELED",
    ).length;
    const completed = bookingWindows.filter(
      (b) => b.status === "COMPLETED",
    ).length;
    const pending = bookingWindows.filter((b) => b.status === "PENDING").length;
    const totalJumpers = bookingWindows.reduce(
      (sum, b) => sum + b.numJumpers,
      0,
    );

    return { total, confirmed, completed, pending, cancelled, totalJumpers };
  }, [bookingWindows]);

  // Filtered bookings - Remove pagination since we're now using scrolling

  const utils = api.useUtils();
  const cancelBookingMutation = api.bookingWindow.cancelBooking.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch the bookings data
      await utils.bookingWindow.getBookingRequestsByUser.invalidate();
      setCancelModalOpen(false);
      setSelectedBookingTableRow(null);
    },
    onError: (error) => {
      console.error("Failed to cancel booking:", error.message);
      // You could add a toast notification here
    },
  });

  const handleCancelClick = (booking: BookingTableRow) => {
    setSelectedBookingTableRow(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmBookingClick = (booking: BookingTableRow) => {
    setSelectedBookingTableRow(booking);
    setConfirmBookingDateModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedBookingTableRow) {
      cancelBookingMutation.mutate({
        id: selectedBookingTableRow.id,
        bookedBy: selectedBookingTableRow.bookedBy,
      });
    }
  };
  const handleContactClick = (user: UserDto) => {
    setSelectedUser(user);
    setContactModalOpen(true);
  };

  const tableData: BookingTableData = useMemo(() => {
    const userMap = new Map(loadedUsers.map((user) => [user.userId, user]));
    return loadedBookingWindows.map((bookingWindow) => ({
      ...bookingWindow,
      bookedByUser: userMap.get(bookingWindow.bookedBy),
      waitlists: loadedWaitlists
        .filter((waitlist) => waitlist.associatedBookingId === bookingWindow.id)
        .map((waitlist) => ({
          ...waitlist,
          entries: waitlist.entries.map((entry) => ({
            ...entry,
            user: userMap.get(entry.waitlistedUserId),
          })),
        })),
      scheduledJumps: loadedScheduledJumps.filter(
        (jump) => jump.associatedBookingId === bookingWindow.id,
      ),
    }));
  }, [
    loadedBookingWindows,
    loadedScheduledJumps,
    loadedUsers,
    loadedWaitlists,
  ]);

  const filteredBookings = useMemo(() => {
    let filtered = tableData;
    if (!showCancelled) {
      filtered = filtered.filter((booking) => booking.status !== "CANCELED");
    }
    if (!showPast) {
      filtered = filtered.filter(
        (booking) => new Date(booking.windowEndDate) >= new Date(),
      );
    }
    // sort filtered by startDate
    filtered.sort((a, b) => {
      const dateA = new Date(a.windowStartDate);
      const dateB = new Date(b.windowStartDate);
      return dateA.getTime() - dateB.getTime();
    });
    return filtered;
  }, [showCancelled, showPast, tableData]);

  console.log("tableData", tableData);

  return (
    <div className="z-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Booking Requests Manager
          </h1>
          <p className="text-gray-600">
            {`Manage your customer's booking requests in one place`}
          </p>
        </div>
        {/* Stats Cards */}
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
        {/* Main Content */}
        <Card className="shadow-2xl">
          <CardBody className="bg-white p-0">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Showing {filteredBookings.length} booking
                  {filteredBookings.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showCancelled}
                      onChange={(e) => setShowCancelled(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show cancelled bookings
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showPast}
                      onChange={(e) => setShowPast(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show past bookings
                    </span>
                  </label>
                </div>
              </div>
            </div>
            {/* Fixed Height Table Container with Scroll */}
            <div className="h-[400px] overflow-auto">
              <Table
                aria-label="Booking table"
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
                  <TableColumn className="text-left">
                    BOOKING WINDOW
                  </TableColumn>
                  <TableColumn className="text-left">BOOKED BY</TableColumn>
                  <TableColumn className="text-center">STATUS</TableColumn>
                  <TableColumn className="text-center">JUMPERS</TableColumn>
                  <TableColumn className="text-center">
                    IDEAL JUMP DATE
                  </TableColumn>
                  <TableColumn className="text-center">
                    SCHEDULED JUMP DATES
                  </TableColumn>
                  <TableColumn className="text-center">DATE BOOKED</TableColumn>
                  <TableColumn className="text-center">WAITLISTS</TableColumn>
                  <TableColumn className="text-center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No bookings found">
                  {filteredBookings.map((booking) => {
                    const user = loadedUsers.find((user) => {
                      return user.userId === booking.bookedBy;
                    });
                    const status = booking.status;
                    return (
                      <TableRow key={booking.id} className="group">
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="mt-2 ml-5">
                              <div className="text-sm font-semibold text-slate-700">
                                {formatDateShort(booking.windowStartDate)} -{" "}
                                {formatDateShort(booking.windowEndDate)}
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <CalendarIcon className="h-3 w-3" />
                                3-day booking window
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {/* Updated Booked By Cell - Now Clickable */}
                        <TableCell>
                          {user ? (
                            <Button
                              variant="ghost"
                              className="h-auto justify-start p-2 text-left transition-colors duration-200 hover:bg-blue-50"
                              onPress={() => handleContactClick(user)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="rounded-full bg-blue-100 p-1">
                                  <UserIcon className="h-3 w-3 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-700">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Click for contact info
                                  </div>
                                </div>
                              </div>
                            </Button>
                          ) : (
                            <div className="text-slate-500 italic">
                              User not found
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center text-black">
                            {status.toLowerCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <div className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-3">
                              <div className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4 text-purple-600" />
                                <span className="text-lg font-bold text-purple-800">
                                  {booking.numJumpers}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                              <div className="text-sm font-semibold text-blue-900">
                                {formatDateShort(booking.idealizedJumpDate)}
                              </div>
                              <div className="text-xs text-blue-600">
                                Preferred
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            {getActiveScheduledJumpDates(booking.scheduledJumps)
                              .length > 0 ? (
                              <div className="space-y-1">
                                {getActiveScheduledJumpDates(
                                  booking.scheduledJumps,
                                )
                                  .sort((a, b) => a.getTime() - b.getTime())
                                  .map((scheduledJumpDate, idx) => (
                                    <div
                                      key={`${idx}-${scheduledJumpDate.toISOString()}`}
                                      className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-sm"
                                    >
                                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-green-800">
                                        {formatDateShort(scheduledJumpDate)}
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
                                {formatDateShort(booking.createdAt)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(booking.createdAt).toLocaleDateString(
                                  "en-US",
                                  { weekday: "short" },
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-center">
                            {booking.waitlists.length > 0 ? (
                              <div className="space-y-1">
                                {booking.waitlists.map((waitlist, idx) => {
                                  // Determine colors based on waitlist status
                                  const getStatusColors = (
                                    status: WaitlistStatus,
                                  ) => {
                                    switch (status) {
                                      case "OPENED":
                                        return {
                                          bg: "bg-yellow-50",
                                          icon: "text-yellow-600",
                                          text: "text-yellow-800",
                                        };
                                      case "CONFIRMED":
                                        return {
                                          bg: "bg-green-50",
                                          icon: "text-green-600",
                                          text: "text-green-800",
                                        };
                                      case "CLOSED":
                                        return {
                                          bg: "bg-red-50",
                                          icon: "text-red-600",
                                          text: "text-red-800",
                                        };
                                      default:
                                        return {
                                          bg: "bg-gray-50",
                                          icon: "text-gray-600",
                                          text: "text-gray-800",
                                        };
                                    }
                                  };

                                  const colors = getStatusColors(
                                    waitlist.status,
                                  );

                                  return (
                                    <div
                                      key={`${idx}-${waitlist.day.toISOString()}`}
                                      className={`flex items-center gap-2 rounded-md ${colors.bg} px-2 py-1 text-sm`}
                                    >
                                      <CheckCircleIcon
                                        className={`h-4 w-4 ${colors.icon}`}
                                      />
                                      <span
                                        className={`font-medium ${colors.text} cursor-pointer`}
                                        onClick={() => {
                                          if (waitlist.status === "CLOSED") {
                                            return;
                                          }
                                          setSelectedWaitlist(waitlist);
                                          setWaitlistModalOpen(true);
                                        }}
                                      >
                                        {formatDateShort(waitlist.day)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <ClockIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-500">
                                    No waitlist signups
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {!(booking.status === "CANCELED") && (
                            <div className="flex justify-center">
                              <BookingActionsDropdown
                                booking={booking}
                                onCancel={() => handleCancelClick(booking)}
                                onConfirmBookingDates={() =>
                                  handleConfirmBookingClick(booking)
                                }
                                onRebook={() => console.log("Rebook:", booking)}
                                onRemove={() => console.log("Remove:", booking)}
                                onViewDetails={() =>
                                  console.log("View Details:", booking)
                                }
                              />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
        {selectedBookingTableRow && (
          <CancelConfirmationModal
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedBookingTableRow(null);
            }}
            onConfirm={handleConfirmCancel}
            booking={selectedBookingTableRow}
          />
        )}
        {selectedBookingTableRow && (
          <ConfirmBookingDatesModal
            adminUserId={adminUserId}
            isOpen={confirmBookingDateModalOpen}
            onClose={() => {
              setConfirmBookingDateModalOpen(false);
              setSelectedBookingTableRow(null);
            }}
            booking={selectedBookingTableRow}
          />
        )}
        {/* New Contact Modal */}
        <ContactModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
        {selectedWaitlist && (
          <AdminWaitlistModal
            isOpen={waitlistModalOpen}
            onClose={() => {
              setWaitlistModalOpen(false);
              setSelectedWaitlist(null);
            }}
            waitlist={selectedWaitlist}
          />
        )}

        {cancelBookingMutation.isPending && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="rounded-lg bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span>Canceling booking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
