import clsx from "clsx";
import moment from "moment";
import { useState } from "react";
import type { ToolbarProps } from "react-big-calendar";

const generateDateOptions = (isAdmin?: boolean) => {
  const options = [];
  const currentDate = new Date();

  const startingMonth = isAdmin ? -12 : 0;

  // Generate options for next 36 months
  for (let i = startingMonth; i < 36; i++) {
    const optionDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      1,
    );
    options.push({
      value: optionDate,
      label: moment.utc(optionDate).format("MMMM YYYY"),
      key: moment.utc(optionDate).format("YYYY-MM"),
    });
  }

  return options;
};

export default function CalendarToolbar({
  onNavigate,
  date,
  isAdmin,
}: ToolbarProps & { isAdmin?: boolean }) {
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const dateOptions = generateDateOptions(isAdmin);
  const isFirstMonth = moment.utc(date).isSame(dateOptions[0]?.value, "month");
  const isLastMonth = moment
    .utc(date)
    .isSame(dateOptions[dateOptions.length - 1]?.value, "month");

  const handleDateSelect = (selectedDate: Date) => {
    onNavigate("DATE", selectedDate);
    setIsMobileDropdownOpen(false);
  };

  const handleDesktopDateSelect = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedDate = new Date(event.target.value);
    onNavigate("DATE", selectedDate);
  };

  const handlePrevClick = () => {
    onNavigate("PREV");
  };

  const handleTodayClick = () => {
    onNavigate("TODAY");
  };

  const handleNextClick = () => {
    onNavigate("NEXT");
  };

  const currentDateOption = dateOptions.find((option) =>
    moment(option.value).isSame(moment(date), "month"),
  );

  return (
    <div className="sm:mb-6">
      {/* Compact Mobile Layout */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-white p-3 shadow-sm sm:hidden">
        {/* Prev Button */}
        <button
          disabled={isFirstMonth}
          onClick={handlePrevClick}
          className={clsx(
            "rounded px-3 py-2 text-sm font-medium transition-colors",
            {
              "cursor-not-allowed bg-gray-200 text-gray-400": isFirstMonth,
              "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700":
                !isFirstMonth,
            },
          )}
        >
          ←
        </button>

        {/* Current Month + Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="flex w-full items-center justify-center gap-1 rounded px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50"
          >
            <span>{moment.utc(date).format("MMM YYYY")}</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isMobileDropdownOpen ? "rotate-180" : ""
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

          {/* Mobile Dropdown Menu */}
          {isMobileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setIsMobileDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {dateOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleDateSelect(option.value)}
                    className={clsx(
                      "w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 focus:bg-blue-50 focus:outline-none",
                      {
                        "bg-blue-100 font-medium text-blue-900": moment
                          .utc(option.value)
                          .isSame(moment.utc(date), "month"),
                        "text-gray-700": !moment
                          .utc(option.value)
                          .isSame(moment.utc(date), "month"),
                      },
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Today Button */}
        <button
          onClick={handleTodayClick}
          className="rounded bg-gray-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Today
        </button>

        {/* Next Button */}
        <button
          disabled={isLastMonth}
          onClick={handleNextClick}
          className={clsx(
            "rounded px-3 py-2 text-sm font-medium transition-colors",
            {
              "cursor-not-allowed bg-gray-200 text-gray-400": isLastMonth,
              "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700":
                !isLastMonth,
            },
          )}
        >
          →
        </button>
      </div>

      {/* Desktop Layout - unchanged */}
      <div className="hidden items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex">
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <button
            disabled={isFirstMonth}
            onClick={handlePrevClick}
            className={clsx(
              "rounded-lg px-4 py-2 font-medium transition-colors",
              {
                "cursor-not-allowed bg-gray-300 text-gray-500": isFirstMonth,
                "bg-blue-500 text-white hover:bg-blue-600": !isFirstMonth,
              },
            )}
          >
            ← Prev
          </button>
          <button
            onClick={handleTodayClick}
            className="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800"
          >
            This month
          </button>
          <button
            disabled={isLastMonth}
            onClick={handleNextClick}
            className={clsx(
              "rounded-lg px-4 py-2 font-medium transition-colors",
              {
                "cursor-not-allowed bg-gray-300 text-gray-500": isLastMonth,
                "bg-blue-500 text-white hover:bg-blue-600": !isLastMonth,
              },
            )}
          >
            Next →
          </button>
        </div>

        {/* Current Month Title */}
        <h2 className="text-xl font-bold text-gray-900">
          {moment.utc(date).format("MMMM YYYY")}
        </h2>

        {/* Desktop Month/Year Dropdown */}
        <div className="relative">
          <select
            value={
              currentDateOption?.value.toISOString() ??
              dateOptions[0]?.value.toISOString()
            }
            onChange={handleDesktopDateSelect}
            className="min-w-[160px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {dateOptions.map((option) => (
              <option key={option.key} value={option.value.toISOString()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
