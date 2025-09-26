import { Listbox, ListboxItem } from "@nextui-org/react";
import {
  formatDateShort,
  getActiveScheduledJumpDatesFromBookingWindow,
} from "mydive/app/_shared-frontend/utils/booking";
import type { BookingWindowPopulatedDto } from "mydive/server/api/routers/types";

export const CancelBookingWindowConfirmationModal = ({
  bookingWindow,
  isOpen,
  onClose,
  onConfirm,
}: {
  bookingWindow: BookingWindowPopulatedDto;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;
  const activeScheduledJumpDates =
    getActiveScheduledJumpDatesFromBookingWindow(bookingWindow);

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Cancel booking window
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to cancel your window for{" "}
          {bookingWindow?.numJumpers ?? 0} jumper(s) for{" "}
          {formatDateShort(bookingWindow.windowStartDate)} to{" "}
          {formatDateShort(bookingWindow.windowStartDate)}?
        </p>
        {activeScheduledJumpDates.length > 0 && (
          <p className="mb-6 text-center text-gray-600">
            <strong>The following dates would be canceled</strong>
            <Listbox>
              {activeScheduledJumpDates.map((scheduledJump) => {
                return (
                  <ListboxItem key={formatDateShort(scheduledJump)}>
                    {formatDateShort(scheduledJump)}
                  </ListboxItem>
                );
              })}
            </Listbox>
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
          >
            Keep booking window
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cancel booking window
          </button>
        </div>
      </div>
    </div>
  );
};
