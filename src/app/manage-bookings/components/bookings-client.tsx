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
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { Booking } from "@prisma/client";
import moment from "moment";
import { BookingActionsDropdown } from "./booking-actions-dropdown";
import { api } from "mydive/trpc/react";
import { CancelConfirmationModal } from "./cancel-confirmation-modal";
import { getConfirmedJumpDays } from "mydive/app/_utils/booking";

export default function BookingsClient({
  loadedBookings,
}: {
  loadedBookings: Booking[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(loadedBookings ?? []);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const itemsPerPage = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showPast, setShowPast] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDateShort = (date: Date) => {
    return moment(date).format("MMM DD YYYY");
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELED").length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const totalJumpers = bookings.reduce((sum, b) => sum + b.numJumpers, 0);

    return { total, confirmed, completed, pending, cancelled, totalJumpers };
  }, [bookings]);

  // Filtered bookings - Remove pagination since we're now using scrolling
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
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
      const dateA = new Date(a.windowStartDay);
      const dateB = new Date(b.windowStartDay);
      return dateA.getTime() - dateB.getTime();
    });
    return filtered;
  }, [bookings, showCancelled, showPast]);

  const utils = api.useUtils();
  const cancelBookingMutation = api.booking.cancelBooking.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch the bookings data
      await utils.booking.getBookingsByUser.invalidate();
      setCancelModalOpen(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      console.error("Failed to cancel booking:", error.message);
      // You could add a toast notification here
    },
  });

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate({
        id: selectedBooking.id,
        createdById: selectedBooking.createdById,
      });
    }
  };

  console.log("bookings", bookings);

  return (
    <div className="z-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Booking Manager
          </h1>
          <p className="text-gray-600">
            Manage and track all your jump bookings in one place
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
                  <TableColumn className="text-center">STATUS</TableColumn>
                  <TableColumn className="text-center">JUMPERS</TableColumn>
                  <TableColumn className="text-center">
                    IDEAL JUMP DATE
                  </TableColumn>
                  <TableColumn className="text-center">
                    CONFIRMED JUMP DATES
                  </TableColumn>
                  <TableColumn className="text-center">DATE BOOKED</TableColumn>
                  <TableColumn className="text-center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No bookings found">
                  {filteredBookings.map((booking) => {
                    const status = booking.status;
                    return (
                      <TableRow key={booking.id} className="group">
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="mt-2 ml-5">
                              <div className="text-sm font-semibold text-slate-700">
                                {formatDateShort(booking.windowStartDay)} -{" "}
                                {formatDateShort(booking.windowEndDate)}
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <CalendarIcon className="h-3 w-3" />
                                3-day booking window
                              </div>
                            </div>
                          </div>
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
                                {formatDateShort(booking.idealizedJumpDay)}
                              </div>
                              <div className="text-xs text-blue-600">
                                Preferred
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-center">
                            {booking.confirmedJumpDays ? (
                              <div className="space-y-1">
                                {getConfirmedJumpDays(booking).map(
                                  (jumpDay, idx) => (
                                    <div
                                      key={`${idx}-${jumpDay.toISOString()}`}
                                      className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-sm"
                                    >
                                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-green-800">
                                        {formatDateShort(jumpDay)}
                                      </span>
                                    </div>
                                  ),
                                )}
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
                          {!(booking.status === "CANCELED") && (
                            <div className="flex justify-center">
                              <BookingActionsDropdown
                                booking={booking}
                                onCancel={() => handleCancelClick(booking)}
                                onModify={() => console.log("Modify:", booking)}
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
        {selectedBooking && (
          <CancelConfirmationModal
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedBooking(null);
            }}
            onConfirm={handleConfirmCancel}
            booking={selectedBooking}
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
