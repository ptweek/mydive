import type { BookingWindow } from "@prisma/client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export const BookingWindowActionsDropdown = ({
  booking,
  onCancel,
}: {
  booking: BookingWindow;
  onCancel: (booking: BookingWindow) => void;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = dropdownRef.current;
      const button = buttonRef.current;
      const target = event.target;

      if (dropdown && button && target && target instanceof Node) {
        if (!dropdown.contains(target) && !button.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 100; // Approximate height

      let top = buttonRect.bottom + window.scrollY + 8; // 8px gap (mt-2)
      let left = buttonRect.right + window.scrollX - dropdownWidth; // Right-aligned

      // Adjust if dropdown would go off-screen
      if (left < 0) {
        left = buttonRect.left + window.scrollX;
      }

      if (top + dropdownHeight > window.innerHeight + window.scrollY) {
        top = buttonRect.top + window.scrollY - dropdownHeight - 8;
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpen]);

  const getActions = () => {
    switch (booking.status) {
      case "UNSCHEDULED":
        return [
          {
            label: "Cancel booking window",
            icon: "❌",
            onClick: () => {
              onCancel(booking);
              setIsOpen(false);
            },
            className: "text-red-600 hover:bg-red-50",
          },
        ];

      case "PENDING_DEPOSIT":
        return [
          {
            label: "Complete booking",
            icon: "💳",
            onClick: () => {
              setIsOpen(false);
              router.push(`payments/${booking.id}`);
            },
            className: "text-slate-700 hover:bg-green-50",
          },
        ];
      case "COMPLETED":
        return [];

      default:
        return [];
    }
  };

  const actions = getActions();

  // Render dropdown using portal for maximum z-index control
  const renderDropdown = () => {
    if (!isOpen) return null;

    const dropdown = (
      <div
        ref={dropdownRef}
        className="fixed w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          zIndex: 9999, // Maximum z-index
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", // Enhanced shadow
        }}
      >
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
    );

    // Use portal to render dropdown at document.body level
    return createPortal(dropdown, document.body);
  };

  return (
    <>
      {/* Three dots button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
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

      {/* Dropdown menu rendered via portal */}
      {renderDropdown()}
    </>
  );
};
