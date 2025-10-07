import { UserIcon } from "@heroicons/react/24/outline";
import { Button } from "@nextui-org/react";
import type {
  BookingStatus,
  ScheduledJumpStatus,
  SchedulingMethod,
} from "@prisma/client";
import {
  formatDateLong,
  formatDateTime,
} from "mydive/app/_shared-frontend/utils/booking";
import { convertBookingZoneEnumToDisplayString } from "mydive/app/_shared-types/defaults";
import type {
  ScheduledJumpDto,
  UserDto,
} from "mydive/server/api/routers/types";
import { api } from "mydive/trpc/react";
import React, { useState } from "react";
import { createPortal } from "react-dom";

const AdminScheduledJumpInfoModal = ({
  scheduledJump,
  isOpen,
  onClose,
  bookingUser,
  adminUser,
}: {
  scheduledJump: ScheduledJumpDto;
  isOpen: boolean;
  onClose: () => void;
  bookingUser: UserDto;
  adminUser: UserDto;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelJumpDate =
    api.adminBookingManager.cancelScheduledJump.useMutation({
      onSuccess: async () => {
        // Invalidate and refetch the bookings data
        onClose();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
        // You could add a toast notification here
      },
    });

  const [cancelConfirmationModalOpen, setCancelConfirmationModal] =
    useState(false);

  if (!isOpen) return null;

  const getStatusBadge = (status: ScheduledJumpStatus) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "SCHEDULED":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "CANCELED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSchedulingMethodInfo = (method: SchedulingMethod) => {
    switch (method) {
      case "BOOKING_WINDOW":
        return {
          label: "Booking Window",
          description: "Scheduled through customer booking window",
          bgColor: "bg-blue-50",
          textColor: "text-blue-900",
          iconColor: "text-blue-600",
        };
      case "WAITLIST":
        return {
          label: "Waitlist",
          description: "Scheduled through waitlist signup",
          bgColor: "bg-purple-50",
          textColor: "text-purple-900",
          iconColor: "text-purple-600",
        };
      default:
        return {
          label: "Unknown",
          description: "Unknown scheduling method",
          bgColor: "bg-gray-50",
          textColor: "text-gray-900",
          iconColor: "text-gray-600",
        };
    }
  };

  const handleCancelJumpDay = async () => {
    setIsSubmitting(true);
    try {
      await cancelJumpDate.mutateAsync({ scheduledJumpId: scheduledJump.id });
      onClose();
    } catch (error) {
      console.error("Failed to confirm booking dates:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeConfirmationModal = () => {
    setCancelConfirmationModal(false);
  };

  const schedulingInfo = getSchedulingMethodInfo(
    scheduledJump.schedulingMethod,
  );

  const modalContent = (
    <>
      {/* Main Modal */}
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="mx-4 max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Scheduled Jump Details
              </h3>
              <span className={getStatusBadge(scheduledJump.status)}>
                {scheduledJump.status}
              </span>
            </div>
            <p className="text-gray-600">
              Jump #{scheduledJump.id} • {scheduledJump.numJumpers} jumper
              {scheduledJump.numJumpers !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Jump Details */}
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Scheduling Method */}
              <div className={`rounded-lg ${schedulingInfo.bgColor} p-3`}>
                <h4 className="mb-1 font-medium text-gray-900">
                  Scheduling Method
                </h4>
                <p className={`font-medium ${schedulingInfo.textColor}`}>
                  {schedulingInfo.label}
                </p>
              </div>

              {/* Jump Date */}
              <div className="rounded-lg bg-blue-50 p-3">
                <h4 className="mb-1 font-medium text-gray-900">Jump Date</h4>
                <p className="text-sm font-medium text-gray-700">
                  {formatDateLong(scheduledJump.jumpDate)}
                </p>
              </div>

              {/* Booking Zone */}
              <div className="rounded-lg bg-gray-50 p-3">
                <h4 className="mb-1 font-medium text-gray-900">Booking Zone</h4>
                <p className="text-sm font-medium text-gray-700">
                  {convertBookingZoneEnumToDisplayString(
                    scheduledJump.bookingZone,
                  )}
                </p>
              </div>

              {/* Participants */}
              <div className="rounded-lg bg-green-50 p-3">
                <h4 className="mb-1 font-medium text-gray-900">Participants</h4>
                <p className="text-sm font-medium text-gray-700">
                  {scheduledJump.numJumpers} jumper
                  {scheduledJump.numJumpers !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Personnel Info */}
          <div className="mb-6">
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Booked By</p>
                    <Button
                      variant="ghost"
                      className="h-auto justify-start p-2 text-left transition-colors duration-200 hover:bg-blue-50"
                      onPress={() => {
                        return;
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-1">
                          <UserIcon className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-700">
                            {bookingUser.firstName} {bookingUser.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            Click for contact info
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDateTime(scheduledJump.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Confirmed By</p>
                    <Button
                      variant="ghost"
                      className="h-auto justify-start p-2 text-left transition-colors duration-200 hover:bg-blue-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-1">
                          <UserIcon className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-700">
                            {adminUser.firstName} {adminUser.lastName}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Last updated: {formatDateTime(scheduledJump.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {scheduledJump.status === "SCHEDULED" && (
            <div className="mb-6 flex justify-center">
              <button
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={() => {
                  setCancelConfirmationModal(true);
                }}
              >
                Cancel Jump
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Sub-Modal */}
      {cancelConfirmationModalOpen && (
        <div className="bg-opacity-75 fixed inset-0 z-60 flex items-center justify-center bg-black">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Jump
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to cancel{" "}
                <span className="font-medium text-gray-900">
                  Jump #{scheduledJump.id}
                </span>{" "}
                scheduled for{" "}
                <span className="font-medium text-gray-900">
                  {formatDateLong(scheduledJump.jumpDate)}
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmationModal}
                className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelJumpDay}
                disabled={isSubmitting}
                className={`rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    <span>Canceling...</span>
                  </div>
                ) : (
                  `Cancel`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AdminScheduledJumpInfoModal;
