import React, { useState } from "react";

const CalendarLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      label: "Open",
      getStyle: () => ({
        backgroundColor: "transparent",
        borderColor: "#d1d5db",
      }),
      description:
        "Days that are open and can be booked as start dates for booking window",
    },
    {
      label: "Non-bookable days",
      getStyle: () => ({
        background:
          "repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #f1f5f9 2px, #f1f5f9 6px)",
        borderColor: "#d1d5db",
        color: "#64748b",
        opacity: 0.9,
        textDecoration: "line-through",
      }),
      description:
        "Days are in the past the present booking availability, or are open as part of a booking window, but not as the start date",
    },
    {
      label: "Reserved",
      getStyle: () => ({
        backgroundColor: "#fecaca",
      }),
      description:
        "Days that have been reserved and do not have waitlist availability",
    },
    {
      label: "Waitlist",
      getStyle: () => ({
        backgroundColor: "#fef3c7",
      }),
      description:
        "Days that have been booked as part of window but have waitlist availability",
    },
    {
      label: "Your Bookings",
      getStyle: () => ({
        backgroundColor: "transparent",
        borderColor: "#d1d5db",
      }),
      showUserIcon: true,
      description: "Days that belong to your bookings",
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Mobile Header - Collapsible */}
      <div className="flex items-center justify-between p-3 sm:hidden">
        <h3 className="text-sm font-semibold text-gray-800">Calendar Legend</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={isExpanded ? "Collapse legend" : "Expand legend"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Desktop Header - Always Visible */}
      <div className="hidden p-4 sm:block">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Calendar Legend
        </h3>
      </div>

      {/* Legend Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-96 pb-3" : "max-h-0 sm:max-h-none"
        } sm:pb-4`}
      >
        {/* Mobile Layout - Stacked */}
        <div className="space-y-2 px-3 sm:hidden">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Color indicator */}
              <div
                className="relative mt-0.5 h-4 w-4 flex-shrink-0 rounded border"
                style={item.getStyle()}
              >
                {item.showUserIcon && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs">
                    👤
                  </span>
                )}
              </div>

              {/* Label and description */}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item.label}
                </div>
                <div className="text-xs leading-relaxed text-gray-600">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout - Grid */}
        <div className="hidden px-4 sm:block">
          <div className="grid grid-cols-1 gap-y-3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4">
            {legendItems.map((item, index) => (
              <div key={index} className="flex min-w-0 items-center gap-3">
                {/* Color indicator */}
                <div
                  className="relative h-6 w-6 flex-shrink-0 rounded border-2"
                  style={item.getStyle()}
                >
                  {item.showUserIcon && (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        fontSize: "8px",
                        opacity: 0.7,
                      }}
                    >
                      👤
                    </span>
                  )}
                </div>

                {/* Label and description */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {item.label}
                  </span>
                  <span className="text-xs leading-tight text-gray-600">
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
