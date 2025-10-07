import {
  formatDateLong,
  formatDateShort,
} from "mydive/app/_shared-frontend/utils/booking";
import type { ScheduledJumpDto } from "mydive/server/api/routers/types";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export const CancelScheduleJumpConfirmationModal = ({
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-w-sm rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Cancel Scheduled Jump
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to cancel your booking for{" "}
          {scheduledJump?.numJumpers} jumper(s) on{" "}
          <strong>{formatDateLong(scheduledJump.jumpDate)}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
          >
            Keep Jump Date
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cancel Jump
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
