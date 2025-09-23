"use client";
import { getActiveScheduledJumpDates } from "mydive/app/_shared-frontend/utils/booking";
import { api } from "mydive/trpc/react";
import { useState, useEffect, useCallback } from "react";
import type { ScheduledJump } from "@prisma/client";
import type { BookingTableRow } from "../../types";

export const ModifyScheduledJumpsModal = ({
  isOpen,
  onClose,
  booking,
  adminUserId,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingTableRow;
  adminUserId: string;
}): React.ReactNode => {
  const { scheduledJumps } = booking;
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modifyBookingMutation =
    api.adminBookingManager.modifyBookingDates.useMutation({
      onSuccess: async () => {
        // Invalidate and refetch the bookings data
        onClose();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
        // You could add a toast notification here
      },
    });

  const getExistingConfirmedDates = useCallback(
    (scheduledJumps: ScheduledJump[]): Date[] => {
      if (!scheduledJumps) return [];
      const parsedJumpDays = getActiveScheduledJumpDates(
        scheduledJumps,
        "BOOKING_WINDOW",
      );
      try {
        // Handle both array of strings and array of objects
        return parsedJumpDays.map((dateStr) => new Date(dateStr));
      } catch (error) {
        console.error("Error parsing confirmed jump days:", error);
        return [];
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      const existingDates = getExistingConfirmedDates(scheduledJumps);
      setSelectedDates(existingDates);
    } else {
      // Reset selection when modal closes
      setSelectedDates([]);
    }
  }, [getExistingConfirmedDates, isOpen, scheduledJumps]);

  const getDateRange = () => {
    const dates: Date[] = [];
    const start = new Date(booking.windowStartDate);
    const end = new Date(booking.windowEndDate);

    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      (selected) => selected.toDateString() === date.toDateString(),
    );
  };

  const toggleDateSelection = (date: Date) => {
    setSelectedDates((prev) => {
      const isSelected = prev.some(
        (selected) => selected.toDateString() === date.toDateString(),
      );

      if (isSelected) {
        return prev.filter(
          (selected) => selected.toDateString() !== date.toDateString(),
        );
      } else {
        return [...prev, date];
      }
    });
  };

  const handleConfirmBookingDate = async () => {
    if (selectedDates.length === 0) return;

    setIsSubmitting(true);
    try {
      await modifyBookingMutation.mutateAsync({
        bookingId: booking.id,
        bookedBy: booking.bookedBy,
        confirmedBy: adminUserId,
        confirmedDates: selectedDates.map((date) => date.toISOString()),
      });
      onClose();
    } catch (error) {
      console.error("Failed to confirm booking dates:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const availableDates = getDateRange();
  const idealizedDate = new Date(booking.idealizedJumpDate);
  const hasExistingConfirmedDates =
    scheduledJumps && getExistingConfirmedDates(scheduledJumps).length > 0;
  if (!isOpen) return null;

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 max-h-[90vh] max-w-lg overflow-y-auto rounded-lg bg-white p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {hasExistingConfirmedDates
              ? "Update Booking Dates"
              : "Confirm Booking Dates"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Existing confirmed dates notice */}
        {hasExistingConfirmedDates && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                This booking already has confirmed dates loaded below
              </span>
            </div>
          </div>
        )}

        {/* Booking Info */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-gray-700">Booking ID:</span>
              <span className="ml-2 text-gray-600">#{booking.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Jumpers:</span>
              <span className="ml-2 text-gray-600">{booking.numJumpers}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span
                className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                  booking.status === "CONFIRMED"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Preferred:</span>
              <span className="ml-2 text-gray-600">
                {formatDate(idealizedDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <h4 className="text-md mb-3 font-medium text-gray-900">
            Available Dates in Customer Window
          </h4>
          <p className="mb-4 text-sm text-gray-600">
            {hasExistingConfirmedDates
              ? "Modify the confirmed dates or add/remove dates as needed."
              : "Select one or more dates you'd like to confirm for the customer's jump."}
          </p>

          <div className="max-h-60 space-y-2 overflow-y-auto">
            {availableDates.map((date) => {
              const isSelected = isDateSelected(date);
              const isPreferred =
                date.toDateString() === idealizedDate.toDateString();

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => toggleDateSelection(date)}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${isPreferred ? "ring-2 ring-green-200" : ""} `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        } `}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatDate(date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPreferred && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Preferred
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmBookingDate}
            disabled={selectedDates.length === 0 || isSubmitting}
            className={`flex-1 rounded-lg px-4 py-2 text-white transition-colors ${
              selectedDates.length === 0 || isSubmitting
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            } `}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                <span>Confirming...</span>
              </div>
            ) : (
              `${hasExistingConfirmedDates ? "Update" : "Confirm"} ${selectedDates.length} Date${selectedDates.length !== 1 ? "s" : ""}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
