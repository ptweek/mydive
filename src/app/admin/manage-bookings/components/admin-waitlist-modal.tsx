import React from "react";
import type { WaitlistStatus } from "@prisma/client";
import type { WaitlistWithUsers } from "./admin-bookings-client";

const AdminWaitlistModal = ({
  waitlist,
  isOpen,
  onClose,
}: {
  waitlist: WaitlistWithUsers;
  isOpen: boolean;
  onClose: () => void;
}) => {
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
  console.log("entries", waitlist.entries);

  return (
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
            {formatDate(waitlist.day)} • {waitlist.entries?.length || 0} entries
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
          {waitlist.entries && waitlist.entries.length > 0 ? (
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {waitlist.entries
                .sort((a, b) => a.position - b.position)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                        {entry.position}
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
                      <span className="text-xs text-gray-500">
                        {formatDateTime(entry.createdAt)}
                      </span>
                      <div className="flex gap-1">
                        <button className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200">
                          Move to Booking
                        </button>
                        <button className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200">
                          Remove
                        </button>
                      </div>
                    </div>
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
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Manage Waitlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWaitlistModal;
