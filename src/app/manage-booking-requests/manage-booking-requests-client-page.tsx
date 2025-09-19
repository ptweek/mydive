"use client";
import React, { useState, useMemo } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { api } from "mydive/trpc/react";
import { CancelConfirmationModal } from "./components/cancel-confirmation-modal";
import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedDto,
} from "mydive/server/api/routers/types";
import BookingRequestsStatsCards from "./components/stats-cards";
import BookingRequestsTable from "./components/booking-requests-table/table";
import BookingRequestsTableFilters from "./components/booking-requests-table/filters";
import { type BookingRequestTableRow } from "./components/booking-requests-table/table";
import {
  isBookingWindowPopulatedDto,
  isWaitlistEntryPopulatedDto,
} from "./_utils/table";
import { getActiveScheduledJumpDatesFromBookingWindow } from "../_utils/booking";

export default function ManageBookingRequestsClient({
  loadedBookingWindows,
  loadedWaitlistEntries,
}: {
  loadedBookingWindows: BookingWindowPopulatedDto[];
  loadedWaitlistEntries: WaitlistEntryPopulatedDto[];
}) {
  // Load States
  const [bookingWindows, setBookingWindows] = useState<
    BookingWindowPopulatedDto[]
  >(loadedBookingWindows ?? []);

  // Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Filter States
  const [showCancelled, setShowCancelled] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Selection States
  const [selectedBookingWindow, setSelectedBookingWindow] =
    useState<BookingWindowPopulatedDto | null>(null);

  // Statistics calculation
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
  }, []);

  const formattedTableData = useMemo(() => {
    const formattedBookingWindowsData: BookingRequestTableRow[] =
      loadedBookingWindows.map((bookingWindow) => {
        const { id, status, numJumpers, createdAt } = bookingWindow;
        return {
          type: "BOOKING_WINDOW",
          id,
          status,
          numJumpers,
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
      loadedWaitlistEntries.map((waitlistEntry) => {
        const { id, status, createdAt, position } = waitlistEntry;
        return {
          type: "WAITLIST_ENTRY",
          id,
          status,
          numJumpers: 1,
          position,
          createdAt,
          requestedJumpDate: waitlistEntry.waitlist.day,
          scheduledJumpDates:
            waitlistEntry.status === "CONFIRMED"
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
  }, [loadedBookingWindows, loadedWaitlistEntries]);

  // Get Filtered Bookings
  const filteredBookings = useMemo(() => {
    let filtered = formattedTableData;

    if (!showCancelled) {
      filtered = filtered.filter((booking) => booking.status !== "CANCELED");
    }
    if (!showPast) {
      filtered = filtered.filter((tableRow) => {
        if (tableRow.type === "BOOKING_WINDOW") {
          if (isBookingWindowPopulatedDto(tableRow.data)) {
            const bookingWindow = tableRow.data;
            return new Date(bookingWindow.windowEndDate) >= new Date();
          } else {
            throw new Error("Issue with booking window");
          }
        } else {
          if (isWaitlistEntryPopulatedDto(tableRow.data)) {
            const waitlistEntryWaitlist = tableRow.data.waitlist;
            return new Date(waitlistEntryWaitlist.day) >= new Date();
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
  }, [formattedTableData, showCancelled, showPast]);

  console.log("filteredBookings", filteredBookings);

  // Mutations
  const utils = api.useUtils();
  const cancelBookingMutation = api.bookingWindow.cancelBooking.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch the bookings data
      await utils.customerBookingManager.getBookingRequestsByUser.invalidate();
      setCancelModalOpen(false);
      setSelectedBookingWindow(null);
    },
    onError: (error) => {
      console.error("Failed to cancel booking:", error.message);
      // You could add a toast notification here
    },
  });

  // Handlers

  const handleCancelClick = (booking: BookingWindowPopulatedDto) => {
    setSelectedBookingWindow(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedBookingWindow) {
      cancelBookingMutation.mutate({
        id: selectedBookingWindow.id,
        bookedBy: selectedBookingWindow.bookedBy,
      });
    }
  };

  return (
    <div className="z-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Booking Requests Manager
          </h1>
          <p className="text-gray-600">Manage and track all your requests</p>
        </div>
        {/* Stats Cards */}
        <BookingRequestsStatsCards stats={stats} />
        <Card className="shadow-2xl">
          <CardBody className="bg-white p-0">
            <BookingRequestsTableFilters
              numVisibleRows={filteredBookings.length}
              showCancelled={showCancelled}
              setShowCancelled={setShowCancelled}
              showPast={showPast}
              setShowPast={setShowPast}
            />
            <div className="h-[400px] overflow-auto">
              <BookingRequestsTable
                tableData={filteredBookings}
                handleBookingWindowCancellationClick={handleCancelClick}
              />
            </div>
          </CardBody>
        </Card>
        {selectedBookingWindow && (
          <CancelConfirmationModal
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedBookingWindow(null);
            }}
            onConfirm={handleConfirmCancel}
            booking={selectedBookingWindow}
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
