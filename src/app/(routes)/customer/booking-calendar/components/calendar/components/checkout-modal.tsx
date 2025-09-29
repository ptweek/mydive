import moment from "moment";
import React, { useState, useEffect } from "react";
import type { CalendarEvent } from "../types";
import Checkout from "mydive/app/_shared-frontend/components/payment/checkout";

const getIdealizedDate = (startDate: Date, dayNumber: number): Date => {
  const date = moment(startDate)
    .add(dayNumber - 1, "days")
    .toDate();
  return date;
};

const getDayNumber = (startDate: Date, idealizedDate: Date): number => {
  return moment(idealizedDate).diff(moment(startDate), "days") + 1;
};

export default function CheckoutModal() {
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseModal = () => {
    console.log("close modal");
  };

  return (
    <>
      {/* Overlay - Lighter on mobile, darker on desktop */}
      <div
        className="bg-opacity-30 sm:bg-opacity-50 fixed inset-0 z-[999] touch-none bg-black backdrop-blur-sm"
        style={{
          backgroundColor: isMobile ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 1)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          minHeight: "100vh",
        }}
        onClick={handleCloseModal}
      />

      {/* Modal content - Mobile responsive */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div
          className="w-full bg-white sm:max-w-md sm:rounded-xl sm:shadow-2xl"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Checkout
            onComplete={() => {
              console.log("insert book now logic");
            }}
          />
        </div>
      </div>
    </>
  );
}
