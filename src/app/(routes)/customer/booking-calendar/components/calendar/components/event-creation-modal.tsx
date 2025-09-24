import moment from "moment";
import type { CalendarEvent } from "../types";

const getIdealizedDate = (startDate: Date, dayNumber: number): Date => {
  const date = moment(startDate)
    .add(dayNumber - 1, "days")
    .toDate();
  return date;
};

const getDayNumber = (startDate: Date, idealizedDate: Date): number => {
  return moment(idealizedDate).diff(moment(startDate), "days") + 1;
};

export default function EventCreationModal({
  newEvent,
  setNewEvent,
  setShowEventForm,
  createEvent,
}: {
  newEvent: CalendarEvent;
  setNewEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  setShowEventForm: React.Dispatch<React.SetStateAction<boolean>>;
  createEvent: () => void;
}) {
  const handleCloseModal = () => {
    setNewEvent(null);
    setShowEventForm(false);
  };

  return (
    <>
      {/* Dark overlay that closes modal when clicked */}
      <div
        className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: "100vh",
          minWidth: "100vw",
        }}
        onClick={handleCloseModal}
      />

      {/* Mobile-responsive modal content */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl sm:p-8">
          <h3 className="mb-4 text-lg font-bold text-black sm:text-xl">
            Create 3-Day Booking Window
          </h3>

          {/* Show user what date they clicked and the resulting 3-day span */}
          <p className="mb-6 text-sm text-gray-700 sm:text-base">
            Booking window: {moment(newEvent.start).format("MMM DD YYYY")} -{" "}
            {moment(newEvent.start).add(2, "days").format("MMM DD YYYY")}
          </p>

          <div className="mb-5 text-black">
            <label className="mb-2 block text-sm font-bold text-gray-800 sm:text-base">
              Number of Jumpers
            </label>
            <select
              value={newEvent.numJumpers ?? 1}
              onChange={(e) => {
                const numJumpers = parseInt(e.target.value);
                setNewEvent({
                  ...newEvent,
                  numJumpers,
                });
              }}
              className="w-full rounded-lg border-2 border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
            </select>
          </div>

          {/* Idealized Day Selection */}
          <div className="mb-6 text-black">
            <label className="mb-2 block text-sm font-bold text-gray-800 sm:text-base">
              Select Desired Jump Day:
            </label>
            <select
              value={getDayNumber(newEvent.start!, newEvent.idealizedDay)}
              onChange={(e) => {
                const dayNumber = parseInt(e.target.value);
                setNewEvent({
                  ...newEvent,
                  idealizedDay: getIdealizedDate(newEvent.start!, dayNumber),
                });
              }}
              className="w-full rounded-lg border-2 border-gray-300 p-3 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
            >
              <option value={1}>
                Day 1 - {moment(newEvent.start).format("MMM DD")}
              </option>
              <option value={2}>
                Day 2 - {moment(newEvent.start).add(1, "day").format("MMM DD")}
              </option>
              <option value={3}>
                Day 3 - {moment(newEvent.start).add(2, "days").format("MMM DD")}
              </option>
            </select>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3">
            <button
              className="w-full cursor-pointer rounded-lg bg-gray-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none sm:w-auto sm:text-base"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base"
              onClick={createEvent}
            >
              Create Event
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
