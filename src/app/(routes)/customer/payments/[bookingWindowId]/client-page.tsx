"use client";
import React from "react";

import Checkout from "mydive/app/_shared-frontend/components/payment/checkout";
import type { BookingWindowDto } from "mydive/server/api/routers/types";
import { formatDateShort } from "mydive/app/_shared-frontend/utils/booking";
import { convertBookingZoneEnumToDisplayString } from "mydive/app/_shared-types/defaults";

export default function PaymentClient({
  bookingWindow,
}: {
  bookingWindow: BookingWindowDto;
}) {
  return (
    <div
      className="flex flex-col space-y-5"
      style={{ height: "calc(100vh - 250px)" }}
    >
      {/* Booking Summary Card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-semibold text-blue-900">
                {convertBookingZoneEnumToDisplayString(
                  bookingWindow.bookingZone,
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-blue-800">
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {formatDateShort(bookingWindow.windowStartDate)} -{" "}
                  {formatDateShort(bookingWindow.windowEndDate)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>
                  {bookingWindow.numJumpers}{" "}
                  {bookingWindow.numJumpers === 1 ? "jumper" : "jumpers"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-900">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Payment Due</span>
          </div>
        </div>
      </div>

      <Checkout bookingWindowId={bookingWindow.id} />
    </div>
  );
}
