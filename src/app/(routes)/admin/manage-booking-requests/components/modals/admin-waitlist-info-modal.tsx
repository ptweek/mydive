import React, { useState } from "react";
import type { WaitlistStatus } from "@prisma/client";
import type { WaitlistEntryWithUser, WaitlistWithUsers } from "../../types";
import { api } from "mydive/trpc/react";
import { useRouter } from "next/navigation";

const AdminWaitlistInfoModal = ({
  waitlist,
  isOpen,
  onClose,
  adminUserId,
}: {
  waitlist: WaitlistWithUsers;
  isOpen: boolean;
  onClose: () => void;
  adminUserId: string;
}) => {
  const router = useRouter();
  // Modal Open States
  const [cancellationModalOpen, setCancellationModalOpen] =
    useState<boolean>(false);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false);

  // Selection
  const [selectedEntry, setSelectedEntry] =
    useState<WaitlistEntryWithUser | null>(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const scheduleJumpDateFromWaitlistEntry =
    api.adminBookingManager.scheduleJumpDateFromWaitlistEntry.useMutation({
      onSuccess: async () => {
        router.refresh();
        onClose();
      },
      onError: (error) => {
        console.error(
          "Failed to schedule jump date from wailist:",
          error.message,
        );
      },
    });
  const cancelWaitlistEntry =
    api.adminBookingManager.cancelWaitlistEntry.useMutation({
      onSuccess: async () => {
        router.refresh();
        onClose();
      },
      onError: (error) => {
        console.error("Failed to remove entry from wailist:", error.message);
      },
    });
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
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: WaitlistStatus) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "OPENED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "CLOSED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleMoveToBookingClick = (entry: WaitlistEntryWithUser) => {
    setSelectedEntry(entry);
    setConfirmationModalOpen(true);
  };

  const handleScheduleFromWailist = async () => {
    if (!selectedEntry) return;
    setIsSubmitting(true);
    try {
      await scheduleJumpDateFromWaitlistEntry.mutateAsync({
        waitlistId: selectedEntry.waitlistId,
        waitlistEntryId: selectedEntry.id,
        bookerId: selectedEntry.waitlistedUserId,
        confirmedBy: adminUserId,
      });
      onClose();
    } catch (error) {
      console.error("Failed to confirm booking dates:", error);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
    setConfirmationModalOpen(false);
  };

  const handleRemoveClick = (entry: WaitlistEntryWithUser) => {
    setSelectedEntry(entry);
    setCancellationModalOpen(true);
  };
  const handleRemoveFromWaitlist = async () => {
    if (!selectedEntry) return;
    setIsSubmitting(true);
    try {
      await cancelWaitlistEntry.mutateAsync({
        waitlistEntryId: selectedEntry.id,
      });
      onClose();
    } catch (error) {
      console.error("Failed to confirm booking dates:", error);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
    setConfirmationModalOpen(false);
  };

  const closeCancellationModal = () => {
    setCancellationModalOpen(false);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="mx-4 max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Waitlist Details
              </h3>
              <span className={getStatusBadge(waitlist.status)}>
                {waitlist.status}
              </span>
            </div>
            <p className="text-gray-600">
              {formatDate(waitlist.day)} •{" "}
              {waitlist.entries?.filter((entry) => {
                return entry.status !== "CANCELED";
              }).length || 0}{" "}
              entries
            </p>
          </div>

          {/* Booking Info */}
          {waitlist.associatedBookingId && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">
                Associated Booking
              </h4>
              <p className="text-sm text-gray-600">
                Booking ID: {waitlist.associatedBookingId}
              </p>
            </div>
          )}

          {/* Waitlist Entries */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-900">Waitlist Entries</h4>
            {waitlist.entries &&
            waitlist.entries.filter((entry) => {
              return entry.status !== "CANCELED";
            }).length > 0 ? (
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {waitlist.entries
                  .filter((entry) => {
                    return entry.status !== "CANCELED";
                  })
                  .sort((a, b) => {
                    if (!a.activePosition || !b.activePosition) {
                      throw Error(
                        "Active waitlist entries do not have active position",
                      );
                    }
                    return a.activePosition - b.activePosition;
                  })
                  .map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="space-y-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center justify-between space-x-10">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                            {entry.activePosition}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {entry.user?.firstName ?? "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {entry.user?.email ?? entry.waitlistedUserId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {idx === 0 && (
                              <button
                                onClick={() => handleMoveToBookingClick(entry)}
                                className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
                              >
                                Move to Booking
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveClick(entry)}
                              className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Entered waitlist: {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p>No entries in this waitlist yet</p>
              </div>
            )}
          </div>

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
      {confirmationModalOpen && selectedEntry && (
        <div className="bg-opacity-75 fixed inset-0 z-60 flex items-center justify-center bg-black">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule Waitlist Entry
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to book{" "}
                <strong>
                  {`${selectedEntry.user?.firstName}` || ""}{" "}
                  {`${selectedEntry.user?.lastName}` || ""}
                </strong>{" "}
                from the waitlist
                <span className="font-medium text-gray-900">
                  {/* {confirmationModal.user?.firstName ?? "Unknown User"} */}
                </span>{" "}
                to jump on{" "}
                <span className="font-medium text-gray-900">
                  {formatDate(waitlist.day)}
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
                disabled={isSubmitting}
                onClick={handleScheduleFromWailist}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Waitlist Removal Sub-Modal */}
      {cancellationModalOpen && selectedEntry && (
        <div className="bg-opacity-75 fixed inset-0 z-60 flex items-center justify-center bg-black">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Remove Waitlist Entry from Waitlist
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to remove{" "}
                <strong>
                  {`${selectedEntry.user?.firstName}` || ""}{" "}
                  {`${selectedEntry.user?.lastName}` || ""}
                </strong>{" "}
                from the waitlist entry queue
                <span className="font-medium text-gray-900">
                  {/* {confirmationModal.user?.firstName ?? "Unknown User"} */}
                </span>{" "}
                for the jump on{" "}
                <span className="font-medium text-gray-900">
                  {formatDate(waitlist.day)}
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeCancellationModal}
                className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleRemoveFromWaitlist}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                {"Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminWaitlistInfoModal;
