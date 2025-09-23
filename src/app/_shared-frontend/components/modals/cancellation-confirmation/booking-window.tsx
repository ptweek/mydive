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

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Cancel Booking
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to cancel your booking for{" "}
          {bookingWindow?.numJumpers} jumper(s) on{" "}
          {bookingWindow?.idealizedJumpDate
            ? new Date(bookingWindow.idealizedJumpDate).toLocaleDateString()
            : "N/A"}
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};
