import moment from "moment";
import React, { useState, useEffect } from "react";
import type { CalendarEvent } from "../types";
import Checkout from "mydive/app/_shared-frontend/components/payment/checkout";

const getIdealizedDate = (startDate: Date, dayNumber: number): Date => {
  const date = moment(startDate)
    .add(dayNumber - 1, "days")
    .toDate();
  return date;
};

const getDayNumber = (startDate: Date, idealizedDate: Date): number => {
  return moment(idealizedDate).diff(moment(startDate), "days") + 1;
};

export default function EventCreationModal({
  newEvent,
  setNewEvent,
  setShowEventForm,
  createEvent,
}: {
  newEvent: CalendarEvent;
  setNewEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  setShowEventForm: React.Dispatch<React.SetStateAction<boolean>>;
  createEvent: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [jumpersDropdownOpen, setJumpersDropdownOpen] = useState(false);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-dropdown")) {
        setJumpersDropdownOpen(false);
        setDayDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseModal = () => {
    setNewEvent(null);
    setShowEventForm(false);
    setJumpersDropdownOpen(false);
    setDayDropdownOpen(false);
  };

  const jumpersOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const dayOptions = [1, 2, 3];

  return (
    <>
      {/* Overlay - Lighter on mobile, darker on desktop */}
      <div
        className="bg-opacity-30 sm:bg-opacity-50 fixed inset-0 z-[999] touch-none bg-black backdrop-blur-sm"
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
        onClick={handleCloseModal}
      />

      {/* Modal content - Mobile responsive */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div
          className="w-full bg-white sm:max-w-md sm:rounded-xl sm:shadow-2xl"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Mobile header with close button */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:hidden">
            <h3 className="text-lg font-semibold text-gray-900">
              Create Booking Window
            </h3>
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
            {/* Desktop header - hidden on mobile */}
            <div className="mb-4 hidden sm:mb-6 sm:block">
              <h3 className="text-xl font-bold text-black">
                Create 3-Day Booking Window
              </h3>
            </div>

            {/* Booking window info */}
            <div className="mb-4 rounded-lg bg-blue-50 p-3 sm:mb-6 sm:p-4">
              <div className="flex items-start">
                <svg
                  className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-blue-400 sm:mr-3 sm:h-5 sm:w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-blue-800 sm:text-sm">
                    Booking Window:
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-700 sm:text-sm">
                    {moment(newEvent.start).format("MMM DD YYYY")} -{" "}
                    {moment(newEvent.start)
                      .add(2, "days")
                      .format("MMM DD YYYY")}
                  </p>
                </div>
              </div>
            </div>

            {/* Number of Jumpers - Custom Dropdown */}
            <div className="custom-dropdown mb-4 sm:mb-5">
              <label className="mb-2 block text-sm font-bold text-gray-800 sm:text-base">
                Number of Jumpers
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setJumpersDropdownOpen(!jumpersDropdownOpen);
                    setDayDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white p-3 text-left text-sm transition-colors hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
                >
                  <span className="text-gray-900">
                    {newEvent.numJumpers || 1}{" "}
                    {(newEvent.numJumpers || 1) === 1 ? "Jumper" : "Jumpers"}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${jumpersDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {jumpersDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-xl">
                    <div className="max-h-60 overflow-auto py-1">
                      {jumpersOptions.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setNewEvent({
                              ...newEvent,
                              numJumpers: num,
                            });
                            setJumpersDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none sm:text-base ${
                            (newEvent.numJumpers || 1) === num
                              ? "bg-blue-100 font-medium text-blue-900"
                              : "text-gray-900 hover:text-blue-900"
                          }`}
                        >
                          {num} {num === 1 ? "Jumper" : "Jumpers"}
                          {(newEvent.numJumpers || 1) === num && (
                            <span className="float-right text-blue-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Jump Day Selection - Custom Dropdown */}
            <div className="custom-dropdown mb-4 sm:mb-6">
              <label className="mb-2 block text-sm font-bold text-gray-800 sm:text-base">
                Select Desired Jump Day
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDayDropdownOpen(!dayDropdownOpen);
                    setJumpersDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white p-3 text-left text-sm transition-colors hover:border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
                >
                  <span className="text-gray-900">
                    Day {getDayNumber(newEvent.start!, newEvent.idealizedDay)} -{" "}
                    {moment(newEvent.idealizedDay).format("MMM DD")}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dayDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dayDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-xl">
                    <div className="py-1">
                      {dayOptions.map((dayNum) => {
                        const date = getIdealizedDate(newEvent.start!, dayNum);
                        const isSelected =
                          getDayNumber(
                            newEvent.start!,
                            newEvent.idealizedDay,
                          ) === dayNum;
                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={() => {
                              setNewEvent({
                                ...newEvent,
                                idealizedDay: date,
                              });
                              setDayDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none sm:text-base ${
                              isSelected
                                ? "bg-blue-100 font-medium text-blue-900"
                                : "text-gray-900 hover:text-blue-900"
                            }`}
                          >
                            Day {dayNum} - {moment(date).format("MMM DD")}
                            {isSelected && (
                              <span className="float-right text-blue-600">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Mobile optimized */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3 sm:pt-4">
              <button
                className="order-2 flex-1 cursor-pointer rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:outline-none active:bg-gray-300 sm:order-1 sm:flex-initial sm:px-5 sm:text-base"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="order-1 flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:flex-initial sm:px-5 sm:text-base"
                onClick={createEvent}
              >
                Create booking request
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
