import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type {
  BookingStatus,
  ScheduledJumpStatus,
  WaitlistEntryStatus,
} from "@prisma/client";

export const getBookingStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case "SCHEDULED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-green-700">
            Jump days scheduled
          </span>
        </div>
      );
    case "UNSCHEDULED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-yellow-100 p-2">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-yellow-700">
            Finalizing jump days
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

    case "PENDING_DEPOSIT":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-slate-100 p-2">
            <ClockIcon className="h-5 w-5 text-slate-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-slate-700">
            Incomplete booking
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

export const getWaitlistEntryStatusIcon = (status: WaitlistEntryStatus) => {
  switch (status) {
    case "WAITING":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-yellow-100 p-2">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-yellow-700">
            On waitlist
          </span>
        </div>
      );
    case "SCHEDULED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-green-700">
            Scheduled from waitlist
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
            Removed from waitlist
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
            {status}
          </span>
        </div>
      );
  }
};

export const getScheduledJumpStatusIcon = (status: ScheduledJumpStatus) => {
  switch (status) {
    case "SCHEDULED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-blue-100 p-2">
            <CalendarIcon className="h-5 w-5 text-green-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-green-600">
            Scheduled
          </span>
        </div>
      );
    case "COMPLETED":
      return (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <span className="ml-2 text-sm font-medium text-green-700">
            Completed
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
            {status}
          </span>
        </div>
      );
  }
};
