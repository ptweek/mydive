"use client";

import Link from "next/link";
import { useState } from "react";

export const UserNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      href: "/customer/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      href: "/customer/booking-calendar",
      label: "Booking Calendar",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
      ),
    },
    {
      href: "/customer/manage-booking-requests",
      label: "Manage Requests",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      ),
    },
    {
      href: "/customer/scheduled-jumps",
      label: "Scheduled Jumps",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      ),
    },
    {
      href: "/info",
      label: "Info",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    {
      href: "/faq",
      label: "FAQ",
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Navigation - shows on medium screens and up */}
      <nav className="hidden items-center gap-3 md:flex">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
          >
            <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
            <div className="relative z-10 transition-transform group-hover:scale-110">
              {item.icon}
            </div>
            <span className="relative z-10">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation - shows on small screens only */}
      <div className="md:hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="group relative flex items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30"
          aria-label="Toggle navigation menu"
        >
          <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
          <svg
            className="relative z-10 h-5 w-5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop - positioned below header */}
            <div
              className="fixed inset-0 top-16 z-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Modal Popup */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ paddingTop: "50vh", paddingBottom: "50vh" }}
            >
              <div className="w-full max-w-xs overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-blue-600/100 to-indigo-600/100 shadow-2xl backdrop-blur-md">
                <div className="space-y-2 p-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group relative flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/20"
                    >
                      <div className="transition-transform group-hover:scale-110">
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
