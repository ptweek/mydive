"use client";
import React, { useState, useMemo } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { api } from "mydive/trpc/react";

import { CancelBookingWindowConfirmationModal } from "mydive/app/_shared-frontend/components/modals/cancellation-confirmation/booking-window";
import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedDto,
} from "mydive/server/api/routers/types";
import BookingRequestsTable from "./components/booking-requests-table/table";
import BookingRequestsTableFilters from "../../../_shared-frontend/components/tables/manage-booking-requests/filters";
import { type BookingRequestTableRow } from "./components/booking-requests-table/table";
import {
  isBookingWindowPopulatedDto,
  isWaitlistEntryPopulatedDto,
} from "mydive/app/_shared-types/type-validation";
import { getActiveScheduledJumpDatesFromBookingWindow } from "mydive/app/_shared-frontend/utils/booking";
import { calculateBookingRequestsStats } from "mydive/app/_shared-frontend/utils/stats";
import { CancelWaitlistEntryConfirmationModal } from "mydive/app/_shared-frontend/components/modals/cancellation-confirmation/waitlist-entry";
import BookingRequestsStatsCards from "mydive/app/_shared-frontend/components/cards/booking-requests-stats-cards";
import { useRouter } from "next/navigation";

export default function ManageBookingRequestsClient({
  loadedBookingWindows,
  loadedWaitlistEntries,
}: {
  loadedBookingWindows: BookingWindowPopulatedDto[];
  loadedWaitlistEntries: WaitlistEntryPopulatedDto[];
}) {
  const router = useRouter();

  // Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [
    cancelWaitlistEntryCancellationModalOpen,
    setWaitlistEntryCancellationModalOpen,
  ] = useState(false);

  // Filter States
  const [showCancelled, setShowCancelled] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Selection States
  const [selectedBookingWindow, setSelectedBookingWindow] =
    useState<BookingWindowPopulatedDto | null>(null);
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] =
    useState<WaitlistEntryPopulatedDto | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    return calculateBookingRequestsStats(
      loadedBookingWindows,
      loadedWaitlistEntries,
    );
  }, [loadedBookingWindows, loadedWaitlistEntries]);

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
      //For now only display active ones
      loadedWaitlistEntries
        .filter((waitlistEntry) => {
          return waitlistEntry.status;
        })
        .map((waitlistEntry) => {
          const { id, status, createdAt, activePosition } = waitlistEntry;
          return {
            type: "WAITLIST_ENTRY",
            id,
            status,
            numJumpers: 1,
            activePosition,
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

  const filteredBookings = useMemo(() => {
    let filtered = formattedTableData;

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
  }, [formattedTableData, showCancelled, showPast]);

  // Mutations
  const cancelBookingMutation =
    api.customerBookingManager.cancelBookingWindow.useMutation({
      onSuccess: async () => {
        setCancelModalOpen(false);
        setSelectedBookingWindow(null);
        router.refresh();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
      },
    });
  const cancelWaitlistEntry =
    api.customerBookingManager.removeWaitlistEntry.useMutation({
      onSuccess: async () => {
        setWaitlistEntryCancellationModalOpen(false);
        setSelectedWaitlistEntry(null);
        router.refresh();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
      },
    });

  // Handlers
  const handleCancelBookingWindowClick = (
    booking: BookingWindowPopulatedDto,
  ) => {
    setSelectedBookingWindow(booking);
    setCancelModalOpen(true);
  };
  const handleCancelWaitlistEntryClick = (
    waitlistEntry: WaitlistEntryPopulatedDto,
  ) => {
    setSelectedWaitlistEntry(waitlistEntry);
    setWaitlistEntryCancellationModalOpen(true);
  };
  const handleConfirmWaitlistEntryCancellation = () => {
    if (selectedWaitlistEntry) {
      cancelWaitlistEntry.mutate({
        waitlistEntryId: selectedWaitlistEntry.id,
      });
    }
  };
  const handleConfirmCancel = () => {
    if (selectedBookingWindow) {
      cancelBookingMutation.mutate({
        bookingWindowId: selectedBookingWindow.id,
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
        {/* Table */}
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
                handleBookingWindowCancellationClick={
                  handleCancelBookingWindowClick
                }
                handleWaitlistEntryCancellationClick={
                  handleCancelWaitlistEntryClick
                }
              />
            </div>
          </CardBody>
        </Card>
        {selectedBookingWindow && (
          <CancelBookingWindowConfirmationModal
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedBookingWindow(null);
            }}
            onConfirm={handleConfirmCancel}
            bookingWindow={selectedBookingWindow}
          />
        )}
        {selectedWaitlistEntry && (
          <CancelWaitlistEntryConfirmationModal
            isOpen={cancelWaitlistEntryCancellationModalOpen}
            onClose={() => {
              setWaitlistEntryCancellationModalOpen(false);
              setSelectedWaitlistEntry(null);
            }}
            onConfirm={handleConfirmWaitlistEntryCancellation}
            waitlistEntry={selectedWaitlistEntry}
          />
        )}
      </div>
    </div>
  );
}
