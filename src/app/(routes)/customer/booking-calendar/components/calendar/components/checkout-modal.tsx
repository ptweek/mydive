import React, { useState, useEffect } from "react";
import type { CalendarEvent } from "../types";
import Checkout from "mydive/app/_shared-frontend/components/payment/checkout";

export default function CheckoutModal({
  setIsOpen,
}: {
  bookingWindow: CalendarEvent;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onComplete: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay - Lighter on mobile, darker on desktop */}
      <div
        className="fixed inset-0 z-[999] touch-none bg-black backdrop-blur-sm"
        style={{
          backgroundColor: isMobile ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 1)",
        }}
        onClick={handleCloseModal}
      />

      {/* Modal content - Mobile responsive */}
      <div className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div
          className="pointer-events-auto w-full max-w-md rounded-xl bg-white shadow-2xl"
          style={{
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          <Checkout />
        </div>
      </div>
    </>
  );
}
