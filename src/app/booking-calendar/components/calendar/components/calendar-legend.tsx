import React from "react";

const CalendarLegend = () => {
  const legendItems = [
    {
      label: "Open",
      backgroundColor: "transparent",
      borderColor: "#e5e7eb",
      description:
        "Days that are open and can be booked as start dates for booking window",
    },
    {
      label: "Non-bookable days",
      backgroundColor: "#fecaca",
      borderColor: "#e5e7eb",
      background:
        "repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #f1f5f9 2px, #f1f5f9 6px)",
      color: "#64748b", // Slate gray text
      opacity: 0.9,
      textDecoration: "line-through", // Add strikethrough for extra visual indication
      description:
        "Days are in the past the present booking availability, or are open as part of a booking window, but not as the start date",
    },
    {
      label: "Reserved",
      backgroundColor: "#fecaca",
      borderColor: "#dc2626",
      description:
        "Days that have been reserved and do not have waitlist avaibility ",
    },
    {
      label: "Waitlist",
      backgroundColor: "#fef3c7",
      borderColor: "#f59e0b",
      description:
        "Days that have been booked as part of window but have waitlist availability",
    },
    {
      label: "Your Bookings",
      backgroundColor: "transparent",
      borderColor: "#e5e7eb",
      showUserIcon: true,
      description: "Days that belong to your bookings",
    },
  ];

  return (
    <div className="flex- flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-800">
        Calendar Legend
      </h3>

      <div className="flex flex-row gap-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Color indicator */}
            <div
              className="relative h-6 w-6 flex-shrink-0 rounded border-2"
              style={{
                backgroundColor: item.backgroundColor,
                borderColor: item.borderColor,
                background: item.background,
                fontWeight:
                  item.label === "Idealized Days"
                    ? "700"
                    : item.label === "Event Days"
                      ? "600"
                      : "normal",
              }}
            >
              {/* User icon for "Your Bookings" */}
              {item.showUserIcon && (
                <span
                  style={{
                    position: "absolute",
                    top: "1px",
                    left: "1px",
                    fontSize: "8px",
                    opacity: 0.7,
                    pointerEvents: "none",
                  }}
                >
                  👤
                </span>
              )}
            </div>

            {/* Label and description */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
              <span className="text-xs text-gray-600">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarLegend;
