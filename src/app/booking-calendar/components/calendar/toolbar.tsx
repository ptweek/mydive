import clsx from "clsx";
import moment from "moment";
import type { ToolbarProps } from "react-big-calendar";

const generateDateOptions = () => {
  const options = [];
  const currentDate = new Date();

  // Generate options for next 24 months
  for (let i = 0; i < 36; i++) {
    const optionDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      1,
    );
    options.push({
      value: optionDate,
      label: moment(optionDate).format("MMMM YYYY"),
      key: moment(optionDate).format("YYYY-MM"),
    });
  }

  return options;
};

export default function CalendarToolbar({ onNavigate, date }: ToolbarProps) {
  const dateOptions = generateDateOptions();
  const isFirstMonth = moment(date).isSame(dateOptions[0]?.value, "month");
  const isLastMonth = moment(date).isSame(
    dateOptions[dateOptions.length - 1]?.value,
    "month",
  );

  const handleDateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = new Date(event.target.value);
    console.log("Dropdown navigation to:", selectedDate);
    onNavigate("DATE", selectedDate);
  };

  const handlePrevClick = () => {
    console.log("Previous button clicked");
    onNavigate("PREV");
  };

  const handleTodayClick = () => {
    console.log("Today button clicked");
    onNavigate("TODAY");
  };

  const handleNextClick = () => {
    console.log("Next button clicked");
    onNavigate("NEXT");
  };

  const currentDateOption = dateOptions.find((option) =>
    moment(option.value).isSame(moment(date), "month"),
  );

  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex-row">
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

      <h2 className="text-xl font-bold text-gray-900">
        {moment(date).format("MMMM YYYY")}
      </h2>

      {/* Center section with current month and dropdown */}
      <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        {/* Month/Year Dropdown */}
        <div className="relative">
          <select
            value={
              currentDateOption?.value.toISOString() ??
              dateOptions[0]?.value.toISOString()
            }
            onChange={handleDateSelect}
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
