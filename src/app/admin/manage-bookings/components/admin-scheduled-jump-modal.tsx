import { UserIcon } from "@heroicons/react/24/outline";
import { Button } from "@nextui-org/react";
import type { BookingStatus, SchedulingMethod } from "@prisma/client";
import type {
  ScheduledJumpDto,
  UserDto,
} from "mydive/server/api/routers/types";
import React, { useState } from "react";

const AdminScheduledJumpModal = ({
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
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: "cancel" | "confirm" | null;
  }>({ isOpen: false, action: null });

  if (!isOpen) return null;

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: Date) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getEndDate = (jumpDate: Date) => {
    const endDate = new Date(jumpDate);
    endDate.setDate(endDate.getDate() + 3);
    return endDate;
  };

  const getStatusBadge = (status: BookingStatus) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "CONFIRMED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "PENDING":
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

  const handleStatusChange = (action: "cancel" | "confirm") => {
    setConfirmationModal({ isOpen: true, action });
  };

  const handleConfirmAction = () => {
    // TODO: Add your mutation logic here
    console.log("Action:", confirmationModal.action);
    console.log("Scheduled Jump ID:", scheduledJump.id);

    // Your mutation call will go here based on the action
    // Example:
    // if (confirmationModal.action === "cancel") {
    //   cancelScheduledJumpMutation({ id: scheduledJump.id })
    // } else if (confirmationModal.action === "confirm") {
    //   confirmScheduledJumpMutation({ id: scheduledJump.id })
    // }

    // Close the confirmation modal
    setConfirmationModal({ isOpen: false, action: null });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({ isOpen: false, action: null });
  };

  const schedulingInfo = getSchedulingMethodInfo(
    scheduledJump.schedulingMethod,
  );

  return (
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
                  {formatDate(scheduledJump.jumpDate)}
                </p>
              </div>

              {/* Booking Zone */}
              <div className="rounded-lg bg-gray-50 p-3">
                <h4 className="mb-1 font-medium text-gray-900">Booking Zone</h4>
                <p className="text-sm font-medium text-gray-700">
                  {scheduledJump.bookingZone}
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
          {scheduledJump.status === "PENDING" && (
            <div className="mb-6 flex justify-center gap-3">
              <button
                onClick={() => handleStatusChange("confirm")}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Confirm Jump
              </button>
              <button
                onClick={() => handleStatusChange("cancel")}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Cancel Jump
              </button>
            </div>
          )}

          {scheduledJump.status === "CONFIRMED" && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => handleStatusChange("cancel")}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
      {confirmationModal.isOpen && (
        <div className="bg-opacity-75 fixed inset-0 z-60 flex items-center justify-center bg-black">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmationModal.action === "cancel"
                  ? "Cancel Jump"
                  : "Confirm Jump"}
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to{" "}
                {confirmationModal.action === "cancel" ? "cancel" : "confirm"}{" "}
                <span className="font-medium text-gray-900">
                  Jump #{scheduledJump.id}
                </span>{" "}
                scheduled for{" "}
                <span className="font-medium text-gray-900">
                  {formatDate(scheduledJump.jumpDate)}
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
                onClick={handleConfirmAction}
                className={`rounded-md px-4 py-2 text-white ${
                  confirmationModal.action === "cancel"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {confirmationModal.action === "cancel"
                  ? "Cancel Jump"
                  : "Confirm Jump"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminScheduledJumpModal;
