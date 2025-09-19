import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { BookingStatus } from "@prisma/client";

export const getBookingStatusIcon = (status: BookingStatus) => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-green-700">
            Confirmed
          </span>
        </div>
      );
    case "PENDING":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-yellow-100 p-2">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-yellow-700">
            Pending
          </span>
        </div>
      );
    case "CANCELED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-red-100 p-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-red-700">
            Canceled
          </span>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-gray-100 p-2">
            <ClockIcon className="h-5 w-5 text-gray-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
            {status.toLowerCase()}
          </span>
        </div>
      );
  }
};
