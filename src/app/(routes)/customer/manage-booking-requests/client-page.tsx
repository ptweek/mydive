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
    <div
      className="flex flex-col space-y-5"
      style={{ height: "calc(100vh - 200px)" }} // I don't love this but it works
    >
      <BookingRequestsStatsCards stats={stats} />

      <div className="flex h-full max-h-full flex-1 flex-col overflow-auto bg-white/95 p-0 shadow-2xl backdrop-blur-sm">
        <BookingRequestsTable
          bookingWindows={loadedBookingWindows}
          waitlistEntries={loadedWaitlistEntries}
          handleBookingWindowCancellationClick={handleCancelBookingWindowClick}
          handleWaitlistEntryCancellationClick={handleCancelWaitlistEntryClick}
        />
      </div>
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
  );
}
