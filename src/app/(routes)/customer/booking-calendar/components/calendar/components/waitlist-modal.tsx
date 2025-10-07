import React, { useState, useEffect } from "react";
import { api } from "mydive/trpc/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { formatDateLong } from "mydive/app/_shared-frontend/utils/booking";

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useUser();
  const joinWaitlistMutation =
    api.customerBookingManager.joinWaitlist.useMutation();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // Get waitlist info for this day
  const {
    data: waitlistInfo,
    refetch: refetchWaitlistInfo,
    isLoading: isLoadingWaitlistInfo,
    error: waitlistInfoError,
  } = api.customerBookingManager.getWaitlistInfo.useQuery(
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
    if (!isSubmitting && !isLoadingWaitlistInfo) {
      setError("");
      setSuccessMessage("");
      setShowSuccess(false);
      onClose();
    }
  };

  const getWaitlistStatusMessage = () => {
    if (waitlistInfoError) {
      return "Unable to load waitlist information";
    }

    if (!waitlistInfo?.exists) {
      return "No one is currently waitlisted. You'll be the first!";
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
      {/* Overlay - Lighter on mobile, darker on desktop */}
      <div
        className="fixed inset-0 z-[999] touch-none"
        style={{
          backgroundColor: isMobile ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 1)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          minHeight: "100vh",
        }}
        onClick={handleClose}
      />

      {/* Modal content - Mobile responsive */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <div
          className="w-full bg-white sm:mx-4 sm:max-w-md sm:rounded-xl sm:shadow-2xl"
          style={{
            // Mobile: slide up from bottom, full width
            // Desktop: centered modal
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Mobile header with close button */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              {waitlistInfo?.isUserOnWaitlist
                ? "Waitlist Status"
                : "Join Waitlist"}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isLoadingWaitlistInfo}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
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

          {/* Content container with mobile-friendly padding */}
          <div className="p-4 sm:p-8">
            {/* Success State */}
            {showSuccess && (
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  {/* Success icon */}
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 sm:mb-4 sm:h-16 sm:w-16">
                    <svg
                      className="h-6 w-6 text-green-600 sm:h-8 sm:w-8"
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
                  <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                    Success!
                  </h2>
                  <p className="mb-2 text-base font-medium text-green-600 sm:text-lg">
                    {successMessage}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {`We'll notify you if a spot opens up on`}{" "}
                    <strong>{formatDateLong(day)}</strong>. You can monitor your
                    waitlist in the{" "}
                    <span
                      className="text-blue-600 underline"
                      onClick={() => {
                        router.push("/customer/manage-booking-requests");
                      }}
                    >
                      Booking Requests
                    </span>{" "}
                    page
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Closing automatically...
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoadingWaitlistInfo && !showSuccess && (
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                    Loading...
                  </h2>
                  <p className="px-2 text-sm text-gray-600 sm:text-base">
                    Checking waitlist status for{" "}
                    <strong>{formatDateLong(day)}</strong>
                  </p>
                </div>

                {/* Loading spinner */}
                <div className="mb-4 flex justify-center sm:mb-6">
                  <svg
                    className="h-6 w-6 animate-spin text-blue-600 sm:h-8 sm:w-8"
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

                {/* Loading cancel button - hidden on desktop as close button exists in header */}
                <div className="flex justify-center sm:hidden">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full max-w-xs rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Loaded Content */}
            {!isLoadingWaitlistInfo && !showSuccess && (
              <>
                {/* Header - hidden on mobile (shown in sticky header) */}
                <div className="mb-4 hidden text-center sm:mb-6 sm:block">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    {waitlistInfo?.isUserOnWaitlist
                      ? "Waitlist Status"
                      : "Join the Waitlist"}
                  </h2>
                  <p className="px-2 text-gray-600">
                    {waitlistInfo?.isUserOnWaitlist
                      ? "You're on the waitlist for"
                      : "Get notified when"}{" "}
                    <strong>{formatDateLong(day)}</strong>{" "}
                    {waitlistInfo?.isUserOnWaitlist
                      ? ""
                      : "becomes available for jumping."}
                  </p>
                </div>

                {/* Mobile-specific header content */}
                <div className="mb-4 text-center sm:hidden">
                  <p className="px-2 text-sm leading-relaxed text-gray-600">
                    {waitlistInfo?.isUserOnWaitlist
                      ? "You're on the waitlist for"
                      : "Get notified when"}{" "}
                    <strong>{formatDateLong(day)}</strong>{" "}
                    {waitlistInfo?.isUserOnWaitlist
                      ? ""
                      : "becomes available for jumping."}
                  </p>
                </div>

                {/* Waitlist Status Info */}
                <div
                  className={`mb-4 rounded-lg p-3 sm:p-4 ${
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
                      className={`mt-0.5 mr-2 h-4 w-4 flex-shrink-0 sm:mr-3 sm:h-5 sm:w-5 ${
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
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium sm:text-sm ${
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
                        className={`mt-1 text-xs leading-relaxed ${
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
                  <div className="mb-4 rounded-lg bg-red-50 p-3 sm:p-4">
                    <div className="flex items-start">
                      <svg
                        className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400 sm:mr-3 sm:h-5 sm:w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs leading-relaxed text-red-800 sm:text-sm">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Content - only show if user is not already on waitlist */}
                {!waitlistInfo?.isUserOnWaitlist && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Info Box */}
                    <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                      <div className="flex items-start">
                        <svg
                          className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-blue-400 sm:mr-3 sm:h-5 sm:w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-blue-800 sm:text-sm">
                            How it works:
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-blue-700">
                            {`You'll be added to the waitlist for this specific
                            day. If a spot opens up, you'll be notified based on
                            your position in the waitlist. First come, first
                            served!`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Info Display */}
                    {user && (
                      <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                        <p className="text-xs text-gray-600 sm:text-sm">
                          {waitlistInfo?.exists
                            ? "Joining"
                            : "Creating waitlist"}{" "}
                          as:{" "}
                          <strong>
                            {user.firstName} {user.lastName}
                          </strong>
                        </p>
                        <p className="text-xs break-all text-gray-500">
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
                  </div>
                )}

                {/* Action Buttons - Mobile optimized */}
                <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:gap-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="order-2 flex-1 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1"
                  >
                    {waitlistInfo?.isUserOnWaitlist ? "Close" : "Cancel"}
                  </button>

                  {!waitlistInfo?.isUserOnWaitlist && (
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={shouldDisableButton()}
                      className="order-1 flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
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
        </div>
      </div>
    </>
  );
}
