"use client";
import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Tooltip,
} from "@nextui-org/react";
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FilmIcon,
  StarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { Booking } from "@prisma/client";
import moment from "moment";

// Mock booking data based on your schema
const mockBookings: Booking[] = [
  {
    id: 1,
    createdAt: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-16T14:20:00"),
    numJumpers: 4,
    windowStartDay: new Date("2024-02-01T08:00:00"),
    windowEndDate: new Date("2024-02-04T20:00:00"),
    idealizedJumpDay: new Date("2024-02-02T12:00:00"),
    confirmedJumpDay: new Date("2024-02-02T14:30:00"),
    createdById: "user-123",
  },
  {
    id: 2,
    createdAt: new Date("2024-01-20T15:45:00"),
    updatedAt: new Date("2024-01-20T15:45:00"),
    numJumpers: 2,
    windowStartDay: new Date("2024-02-10T08:00:00"),
    windowEndDate: new Date("2024-02-13T20:00:00"),
    idealizedJumpDay: new Date("2024-02-11T10:00:00"),
    confirmedJumpDay: null,
    createdById: "user-456",
  },
  {
    id: 3,
    createdAt: new Date("2024-01-25T09:15:00"),
    updatedAt: new Date("2024-01-26T11:30:00"),
    numJumpers: 8,
    windowStartDay: new Date("2024-02-20T08:00:00"),
    windowEndDate: new Date("2024-02-23T20:00:00"),
    idealizedJumpDay: new Date("2024-02-21T13:00:00"),
    confirmedJumpDay: new Date("2024-02-21T13:00:00"),
    createdById: "user-789",
  },
  {
    id: 4,
    createdAt: new Date("2024-02-01T12:00:00"),
    updatedAt: new Date("2024-02-01T12:00:00"),
    numJumpers: 6,
    windowStartDay: new Date("2024-03-01T08:00:00"),
    windowEndDate: new Date("2024-03-04T20:00:00"),
    idealizedJumpDay: new Date("2024-03-02T15:00:00"),
    confirmedJumpDay: null,
    createdById: "user-321",
  },
  {
    id: 5,
    createdAt: new Date("2024-02-05T16:30:00"),
    updatedAt: new Date("2024-02-06T09:45:00"),
    numJumpers: 3,
    windowStartDay: new Date("2024-03-15T08:00:00"),
    windowEndDate: new Date("2024-03-18T20:00:00"),
    idealizedJumpDay: new Date("2024-03-16T11:00:00"),
    confirmedJumpDay: new Date("2024-03-17T11:00:00"),
    createdById: "user-654",
  },
];

export default function BookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Helper functions
  const getBookingStatus = (booking: Booking) => {
    if (booking.confirmedJumpDay) {
      return new Date() > new Date(booking.confirmedJumpDay)
        ? "completed"
        : "confirmed";
    }
    if (new Date() > new Date(booking.windowEndDate)) {
      return "expired";
    }
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "completed":
        return "primary";
      case "expired":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

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
    const confirmed = bookings.filter(
      (b) => getBookingStatus(b) === "confirmed",
    ).length;
    const completed = bookings.filter(
      (b) => getBookingStatus(b) === "completed",
    ).length;
    const pending = bookings.filter(
      (b) => getBookingStatus(b) === "pending",
    ).length;
    const expired = bookings.filter(
      (b) => getBookingStatus(b) === "expired",
    ).length;
    const totalJumpers = bookings.reduce((sum, b) => sum + b.numJumpers, 0);

    return { total, confirmed, completed, pending, expired, totalJumpers };
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.id.toString().includes(searchTerm) ||
          booking.createdById.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => getBookingStatus(booking) === statusFilter,
      );
    }

    // Filter by tab
    if (selectedTab !== "all") {
      filtered = filtered.filter(
        (booking) => getBookingStatus(booking) === selectedTab,
      );
    }

    return filtered;
  }, [bookings, searchTerm, statusFilter, selectedTab]);

  // Paginated bookings
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    onOpen();
  };

  return (
    <div className="z-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Booking Dashboard
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
            {/* Booking Table */}
            <Table
              aria-label="Booking table"
              className="min-h-[400px]"
              removeWrapper
              classNames={{
                th: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b-2 border-slate-200 py-4",
                td: "py-4 px-6 border-b border-slate-100",
                tr: "hover:bg-slate-50/50 transition-colors duration-200",
              }}
            >
              <TableHeader>
                <TableColumn className="text-left">BOOKING WINDOW</TableColumn>
                <TableColumn className="text-center">STATUS</TableColumn>
                <TableColumn className="text-center">JUMPERS</TableColumn>
                <TableColumn className="text-center">
                  IDEAL JUMP DATE
                </TableColumn>
                <TableColumn className="text-center">
                  CONFIRMED JUMP DATE
                </TableColumn>
                <TableColumn className="text-center">DATE BOOKED</TableColumn>
                <TableColumn className="text-center">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No bookings found">
                {paginatedBookings.map((booking) => {
                  const status = getBookingStatus(booking);
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
                          {status}
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
                          <Tooltip
                            content={formatDate(booking.idealizedJumpDay)}
                            placement="top"
                          >
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                              <div className="text-sm font-semibold text-blue-900">
                                {formatDateShort(booking.idealizedJumpDay)}
                              </div>
                              <div className="text-xs text-blue-600">
                                Preferred
                              </div>
                            </div>
                          </Tooltip>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center">
                          {booking.confirmedJumpDay ? (
                            <Tooltip
                              content={formatDate(booking.confirmedJumpDay)}
                              placement="top"
                            >
                              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center">
                                <div className="text-sm font-semibold text-green-900">
                                  {formatDateShort(booking.confirmedJumpDay)}
                                </div>
                                <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                                  <CheckCircleIcon className="h-3 w-3" />
                                  Confirmed
                                </div>
                              </div>
                            </Tooltip>
                          ) : (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                              <div className="text-sm font-medium text-gray-500">
                                Pending
                              </div>
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                                <ClockIcon className="h-3 w-3" />
                                Not confirmed
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
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            startContent={<EyeIcon className="h-4 w-4" />}
                            onPress={() => viewBookingDetails(booking)}
                          >
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center p-4">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                  showShadow
                  color="primary"
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Booking Details Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h3>Booking Details #{selectedBooking?.id}</h3>
                  <Chip
                    color={getStatusColor(getBookingStatus(selectedBooking))}
                    size="sm"
                    variant="flat"
                    className="w-fit capitalize"
                  >
                    {getBookingStatus(selectedBooking)}
                  </Chip>
                </ModalHeader>
                <ModalBody>
                  {selectedBooking && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader className="pb-2">
                            <h4 className="font-semibold">Basic Information</h4>
                          </CardHeader>
                          <CardBody className="space-y-3 pt-0">
                            <div>
                              <span className="text-sm text-gray-500">
                                Created by:
                              </span>
                              <p className="font-medium">
                                {selectedBooking.createdById}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Number of jumpers:
                              </span>
                              <p className="font-medium">
                                {selectedBooking.numJumpers}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Created on:
                              </span>
                              <p className="font-medium">
                                {formatDate(selectedBooking.createdAt)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Last updated:
                              </span>
                              <p className="font-medium">
                                {formatDate(selectedBooking.updatedAt)}
                              </p>
                            </div>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <h4 className="font-semibold">
                              Schedule Information
                            </h4>
                          </CardHeader>
                          <CardBody className="space-y-3 pt-0">
                            <div>
                              <span className="text-sm text-gray-500">
                                Booking window start:
                              </span>
                              <p className="font-medium">
                                {formatDate(selectedBooking.windowStartDay)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Booking window end:
                              </span>
                              <p className="font-medium">
                                {formatDate(selectedBooking.windowEndDate)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Idealized jump day:
                              </span>
                              <p className="font-medium">
                                {formatDate(selectedBooking.idealizedJumpDay)}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Confirmed jump day:
                              </span>
                              <p className="font-medium">
                                {selectedBooking.confirmedJumpDay
                                  ? formatDate(selectedBooking.confirmedJumpDay)
                                  : "Not confirmed yet"}
                              </p>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
