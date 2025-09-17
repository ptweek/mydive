import React, { useState } from "react";
import { api } from "mydive/trpc/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: Date; // The specific day to join waitlist for
  associatedBookingId: number; // The booking this waitlist is for
  onSuccess?: (message: string, position: number) => void; // Optional success callback
}

export default function WaitlistModal({
  isOpen,
  onClose,
  day,
  associatedBookingId,
  onSuccess,
}: WaitlistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const { user } = useUser();
  const joinWaitlistMutation = api.bookingWindow.joinWaitlist.useMutation();

  // Get waitlist info for this day
  const {
    data: waitlistInfo,
    refetch: refetchWaitlistInfo,
    isLoading: isLoadingWaitlistInfo,
    error: waitlistInfoError,
  } = api.bookingWindow.getWaitlistInfo.useQuery(
    {
      day: day,
      userId: user?.id ?? "",
    },
    {
      enabled: isOpen && !!user?.id, // Only run query when modal is open and user exists
    },
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError("You must be logged in to join a waitlist");
      return;
    }

    if (waitlistInfo?.isUserOnWaitlist) {
      setError("You are already on this waitlist");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await joinWaitlistMutation.mutateAsync({
        day: day,
        associatedBookingId: associatedBookingId,
        userId: user.id,
      });

      // Show success message
      setSuccessMessage(
        `Congrats! You're on the waitlist at position #${result.userPosition}`,
      );
      setShowSuccess(true);

      // Refetch waitlist info to update the display
      await refetchWaitlistInfo();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.message, result.userPosition);
      }

      // Close modal after showing success for 2 seconds
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Error joining waitlist:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to join waitlist. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoadingWaitlistInfo && !showSuccess) {
      setError("");
      setSuccessMessage("");
      setShowSuccess(false);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWaitlistStatusMessage = () => {
    if (waitlistInfoError) {
      return "Unable to load waitlist information";
    }

    if (!waitlistInfo?.exists) {
      return "No waitlist exists for this day yet. You'll be the first!";
    }

    if (waitlistInfo.isUserOnWaitlist) {
      return `You're already on this waitlist at position #${waitlistInfo.userPosition}`;
    }

    return `${waitlistInfo.totalCount} ${waitlistInfo.totalCount === 1 ? "person is" : "people are"} currently on the waitlist`;
  };

  const getButtonText = () => {
    if (!waitlistInfo?.exists) {
      return "Create & Join Waitlist";
    }
    if (waitlistInfo.isUserOnWaitlist) {
      return "Already on Waitlist";
    }
    return "Join Waitlist";
  };

  const shouldDisableButton = () => {
    return isSubmitting || !user?.id || waitlistInfo?.isUserOnWaitlist;
  };

  return (
    <>
      {/* Dark overlay */}
      <div
        className="bg-opacity-50 fixed inset-0 z-[999] bg-black"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div className="fixed top-1/2 left-1/2 z-[1000] w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-white p-8 shadow-2xl">
        {/* Success State */}
        {showSuccess && (
          <div className="text-center">
            <div className="mb-6">
              {/* Success icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Success!
              </h2>
              <p className="mb-2 text-lg font-medium text-green-600">
                {successMessage}
              </p>
              <p className="text-sm text-gray-600">
                {`We'll notify you if a spot opens up on`}{" "}
                <strong>{formatDate(day)}</strong>. You can monitor your
                waitlist in the{" "}
                <Link className="text-blue-400" href={"/manage-bookings"}>
                  Manage Bookings
                </Link>{" "}
                page
              </p>
            </div>

            {/* Success animation/checkmark could go here */}
            <div className="text-xs text-gray-500">
              Closing automatically...
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingWaitlistInfo && !showSuccess && (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Loading...
              </h2>
              <p className="text-gray-600">
                Checking waitlist status for <strong>{formatDate(day)}</strong>
              </p>
            </div>

            {/* Loading spinner */}
            <div className="mb-6 flex justify-center">
              <svg
                className="h-8 w-8 animate-spin text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            {/* Loading cancel button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoadingWaitlistInfo && !showSuccess && (
          <>
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {waitlistInfo?.isUserOnWaitlist
                  ? "Waitlist Status"
                  : "Join the Waitlist"}
              </h2>
              <p className="text-gray-600">
                {waitlistInfo?.isUserOnWaitlist
                  ? "You're on the waitlist for"
                  : "Get notified when"}{" "}
                <strong>{formatDate(day)}</strong>{" "}
                {waitlistInfo?.isUserOnWaitlist
                  ? ""
                  : "becomes available for jumping."}
              </p>
            </div>

            {/* Waitlist Status Info */}
            <div
              className={`mb-4 rounded-lg p-4 ${
                waitlistInfoError
                  ? "border border-red-200 bg-red-50"
                  : waitlistInfo?.isUserOnWaitlist
                    ? "border border-green-200 bg-green-50"
                    : waitlistInfo?.exists
                      ? "border border-yellow-200 bg-yellow-50"
                      : "border border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-start">
                <svg
                  className={`mt-0.5 mr-3 h-5 w-5 flex-shrink-0 ${
                    waitlistInfoError
                      ? "text-red-500"
                      : waitlistInfo?.isUserOnWaitlist
                        ? "text-green-500"
                        : waitlistInfo?.exists
                          ? "text-yellow-500"
                          : "text-blue-500"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      waitlistInfoError
                        ? "text-red-800"
                        : waitlistInfo?.isUserOnWaitlist
                          ? "text-green-800"
                          : waitlistInfo?.exists
                            ? "text-yellow-800"
                            : "text-blue-800"
                    }`}
                  >
                    Waitlist Status:
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      waitlistInfoError
                        ? "text-red-700"
                        : waitlistInfo?.isUserOnWaitlist
                          ? "text-green-700"
                          : waitlistInfo?.exists
                            ? "text-yellow-700"
                            : "text-blue-700"
                    }`}
                  >
                    {getWaitlistStatusMessage()}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4">
                <div className="flex items-start">
                  <svg
                    className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Form - only show if user is not already on waitlist */}
            {!waitlistInfo?.isUserOnWaitlist && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Info Box */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start">
                    <svg
                      className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        How it works:
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        {`You'll be added to the waitlist for this specific day. If a spot opens up, you'll be notified based on your position in the waitlist. First come, first served!`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Info Display */}
                {user && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      {waitlistInfo?.exists ? "Joining" : "Creating waitlist"}{" "}
                      as:{" "}
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                    {waitlistInfo?.exists && (
                      <p className="mt-1 text-xs text-gray-500">
                        {`You'll be position #`}
                        {(waitlistInfo.totalCount || 0) + 1}
                      </p>
                    )}
                  </div>
                )}
              </form>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {waitlistInfo?.isUserOnWaitlist ? "Close" : "Cancel"}
              </button>

              {!waitlistInfo?.isUserOnWaitlist && (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={shouldDisableButton()}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Joining...
                    </div>
                  ) : (
                    getButtonText()
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
