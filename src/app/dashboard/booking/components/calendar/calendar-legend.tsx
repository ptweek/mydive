import React from "react";

const CalendarLegend = () => {
  const legendItems = [
    {
      label: "Reserved",
      backgroundColor: "#fecaca",
      borderColor: "#dc2626",
      description: "Days that have been reserved for jump",
    },
    {
      label: "Waitlist",
      backgroundColor: "#fef3c7",
      borderColor: "#f59e0b",
      description: "Days that have been booked but have waitlist availability",
    },
    {
      label: "Open",
      backgroundColor: "transparent",
      borderColor: "#e5e7eb",
      description: "Days that have not been booked or reserved",
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
              className="h-6 w-6 flex-shrink-0 rounded border-2"
              style={{
                backgroundColor: item.backgroundColor,
                borderColor: item.borderColor,
                fontWeight:
                  item.label === "Idealized Days"
                    ? "700"
                    : item.label === "Event Days"
                      ? "600"
                      : "normal",
              }}
            />

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
