import moment from "moment";
import { useState } from "react";
import type { ToolbarProps } from "react-big-calendar";

export default function CalendarToolbar({ onNavigate, date }: ToolbarProps) {
  // Generate month/year options for the next 2 years
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

  const dateOptions = generateDateOptions();
  const [dateState, setDateState] = useState(date);

  const handleDateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = new Date(event.target.value);
    setDateState(selectedDate);
    onNavigate("DATE", selectedDate);
  };

  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex-row">
      {/* Navigation buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            onNavigate("PREV");
            const prevMonth = moment(dateState).subtract(1, "month").toDate();
            setDateState(prevMonth);
          }}
          className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
        >
          ← Prev
        </button>
        <button
          onClick={() => {
            onNavigate("TODAY");
            const thisMonth = moment().toDate();
            setDateState(thisMonth);
          }}
          className="rounded-lg bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800"
        >
          This month
        </button>
        <button
          onClick={() => {
            onNavigate("NEXT");
            const nextMonth = moment(dateState).add(1, "month").toDate();
            setDateState(nextMonth);
          }}
          className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
        >
          Next →
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-900">
        {moment(dateState).format("MMMM YYYY")}
      </h2>

      {/* Center section with current month and dropdown */}
      <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        {/* Month/Year Dropdown */}
        <div className="relative">
          <select
            value={
              dateOptions
                .find(
                  (option) =>
                    moment(option.value).format("MMMM YYYY") ===
                    moment(dateState).format("MMMM YYYY"),
                )
                ?.value.toISOString() ?? dateOptions[0]?.value.toISOString()
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
