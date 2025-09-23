import type { BookingWindow } from "@prisma/client";
import React, { useState, useRef, useEffect } from "react";

export const BookingWindowActionsDropdown = ({
  booking,
  onCancel,
}: {
  booking: BookingWindow;
  onCancel: (booking: BookingWindow) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = dropdownRef.current;
      const target = event.target;

      if (dropdown && target && target instanceof Node) {
        if (!dropdown.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActions = () => {
    switch (booking.status) {
      case "PENDING":
        return [
          {
            label: "Cancel Booking",
            icon: "❌",
            onClick: () => {
              onCancel(booking);
              setIsOpen(false);
            },
            className: "text-red-600 hover:bg-red-50",
          },
        ];

      case "CONFIRMED":
        return [
          {
            label: "Cancel Booking",
            icon: "❌",
            onClick: () => {
              setIsOpen(false);
            },
            className: "text-red-600 hover:bg-red-50",
          },
        ];

      case "COMPLETED":
        return [];

      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Three dots button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
        aria-label="More actions"
      >
        <svg
          className="h-5 w-5 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors duration-150 ${action.className}`}
            >
              <span className="text-base">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
