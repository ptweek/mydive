import moment from "moment";
import type { CalendarEvent } from "src/app/customer/booking-calendar/components/calendar/types";

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
        className="bg-opacity-50 fixed inset-0 z-[999] bg-black"
        onClick={handleCloseModal}
      />

      {/* Modal content with Tailwind classes */}
      <div className="fixed top-1/2 left-1/2 z-[1000] min-w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-white p-8 shadow-2xl">
        <h3 className="mb-4 text-xl font-bold text-black">
          Create 3-Day Booking Window
        </h3>

        {/* Show user what date they clicked and the resulting 3-day span */}
        <p className="mb-6 text-gray-700">
          Booking window: {moment(newEvent.start).format("MMM DD YYYY")} -{" "}
          {moment(newEvent.start).add(2, "days").format("MMM DD YYYY")}
        </p>
        <div className="mb-5 text-black">
          <label className="mb-1.5 block font-bold text-gray-800">
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
            className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm focus:border-blue-600 focus:outline-none"
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
        <div className="mb-5 text-black">
          <label className="mb-1.5 block font-bold text-gray-800">
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
            className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm focus:border-blue-600 focus:outline-none"
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5">
          <button
            className="cursor-pointer rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
            onClick={() => {
              setNewEvent(null);
              setShowEventForm(false);
            }}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={createEvent}
          >
            Create Event
          </button>
        </div>
      </div>
    </>
  );
}
