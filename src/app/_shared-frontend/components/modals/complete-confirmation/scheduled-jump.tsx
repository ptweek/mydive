import { formatDateShort } from "mydive/app/_shared-frontend/utils/booking";
import type { ScheduledJumpDto } from "mydive/server/api/routers/types";

export const CompleteScheduleJumpConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  scheduledJump,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scheduledJump: ScheduledJumpDto;
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Complete Scheduled Jump
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to complete the booking booking for{" "}
          {scheduledJump?.numJumpers} jumper(s) on{" "}
          {formatDateShort(scheduledJump.jumpDate)}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Complete Jump
          </button>
        </div>
      </div>
    </div>
  );
};
