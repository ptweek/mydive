"use client";

import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CalendarToolbar from "./toolbar";
import EventComponent from "./event";
import CalendarLegend from "./calendar-legend";

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);
export default function SchedulingCalendar() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Booked Window",
      start: new Date(2025, 7, 15), // September 15 (start of 3-day period)
      end: new Date(2025, 7, 18), // September 18 (exclusive end - so event shows 15,16,17)
      idealizedDay: new Date(2025, 7, 16), // September 16 (the special day within the 3-day span)
      resource: { type: "custom-3day" }, // Custom metadata to identify our special event type
    },
  ]);

  // STATE: Controls whether the event creation modal is visible
  const [showEventForm, setShowEventForm] = useState(false);

  // STATE: Stores the date/time slot that user clicked on the calendar
  const [selectedSlot, setSelectedSlot] = useState(null);

  // STATE: Form data for creating new events
  const [newEvent, setNewEvent] = useState({
    title: "", // Event name entered by user
    startDate: "", // Date string in YYYY-MM-DD format
    idealizedDay: 1, // Which day of the 3-day span is idealized (1, 2, or 3)
  });

  // HANDLER: Called when user clicks on an empty calendar slot
  // useCallback prevents unnecessary re-renders by memoizing the function
  const handleSelectSlot = useCallback((slotInfo) => {
    // Store the clicked date for reference
    setSelectedSlot(slotInfo.start);

    // Pre-populate the form with the clicked date
    setNewEvent({
      title: "",
      startDate: moment(slotInfo.start).format("YYYY-MM-DD"), // Convert to string format for input
      idealizedDay: 1, // Default to first day being idealized
    });

    // Show the event creation modal
    setShowEventForm(true);
  }, []);

  // HANDLER: Creates a new 3-day event from the form data
  const createEvent = () => {
    // Validation: Don't create event if title or date is missing
    if (!newEvent.title || !newEvent.startDate) return;

    // Calculate the 3-day span using moment.js
    const startDate = moment(newEvent.startDate);
    const endDate = moment(startDate).add(3, "days"); // Add 3 days for the span

    // Calculate which specific day within the span is idealized
    // idealizedDay is 1-indexed (1, 2, or 3), so subtract 1 for 0-indexed addition
    const idealizedDate = moment(startDate).add(
      newEvent.idealizedDay - 1,
      "days",
    );

    // Create the event object that matches Big React Calendar's expected format
    const event = {
      id: Date.now(), // Simple ID generation (use proper UUID in production)
      title: newEvent.title,
      start: startDate.toDate(), // Convert moment back to JavaScript Date object
      end: endDate.toDate(),
      idealizedDay: idealizedDate.toDate(), // Our custom field for the special day
      resource: { type: "custom-3day" }, // Metadata to identify our custom event type
    };

    // Add the new event to the existing events array
    setEvents([...events, event]);

    // Close the modal and reset the form
    setShowEventForm(false);
    setNewEvent({ title: "", startDate: "", idealizedDay: 1 });
  };

  // STYLING FUNCTION: Defines how events should look on the calendar
  const eventPropGetter = (event) => {
    // Check if this is one of our custom 3-day events
    if (event.resource?.type === "custom-3day") {
      // Return custom styling for our 3-day events
      return {
        className: "three-day-event", // CSS class name
        style: {
          backgroundColor: "#3174ad", // Blue background
          borderRadius: "5px",
          opacity: 0.8,
          color: "white",
          border: "2px solid #1a5490", // Darker blue border
          fontSize: "12px",
        },
      };
    }
    return {};
  };

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Handle clicking on an existing event
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  // Handle deleting an event
  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent) {
      setEvents((prev) =>
        prev.filter((event) => event.id !== selectedEvent.id),
      );
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  }, [selectedEvent]);

  // Add this function to style individual day cells
  const dayPropGetter = useCallback(
    (date) => {
      // Check if this date has any events
      const maybeEvent = events.filter((event) => {
        return (
          moment(event.start).isSame(moment(date), "day") ||
          moment(event.start).isSame(moment(date).subtract(1, "day"), "day") ||
          moment(event.start).isSame(moment(date).subtract(2, "day"), "day")
        );
      })[0];

      if (maybeEvent) {
        // Check if this day matches the idealized day
        const isIdealizedDay = moment(date).isSame(
          moment(maybeEvent.idealizedDay),
          "day",
        );

        if (isIdealizedDay) {
          // RED for idealized days
          return {
            style: {
              backgroundColor: "#fecaca", // Light red background
              border: "solid #dc2626", // Red border
              fontWeight: "700",
            },
          };
        } else {
          // YELLOW for other event days (not idealized)
          return {
            style: {
              backgroundColor: "#fef3c7", // Light yellow background
              border: "solid #f59e0b", // Yellow border
              fontWeight: "600",
            },
          };
        }
      }

      return {}; // No styling for days without events
    },
    [events],
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Scheduling Calendar</h1>
        <p className="text-white">
          Book an isolated three day window, or hop on the waitlist.
        </p>
      </div>

      {/* Calendar */}
      <CalendarLegend />
      <div
        style={{ height: "600px" }}
        className="rounded-lg bg-white p-4 text-black shadow-lg"
      >
        <Calendar
          localizer={localizer} // Date handling utility
          events={[]} // Array of events to display
          startAccessor="start" // Which property contains event start time
          endAccessor="end" // Which property contains event end time
          style={{ height: 500 }} // Fixed height for calendar (keep as inline style for Big React Calendar)
          onSelectSlot={handleSelectSlot} // Called when user clicks empty calendar slot
          selectable={true} // Enables clicking on empty slots
          dayPropGetter={dayPropGetter}
          components={{
            toolbar: CalendarToolbar,
            event: EventComponent,
          }}
          eventPropGetter={eventPropGetter} // Function that returns styling for events
          views={["month"]} // Available calendar views
          step={60} // Time slot step in minutes (for week/day views)
          showMultiDayTimes // Show times for multi-day events
        />
      </div>

      {/* MODAL: Event creation form with Tailwind styling */}
      {showEventForm && (
        <>
          {/* Dark overlay that closes modal when clicked */}
          <div
            className="bg-opacity-50 fixed inset-0 z-[999] bg-black"
            onClick={() => setShowEventForm(false)}
          />

          {/* Modal content with Tailwind classes */}
          <div className="fixed top-1/2 left-1/2 z-[1000] min-w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-white p-8 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-black">
              Create 3-Day Booking Window
            </h3>

            {/* Show user what date they clicked and the resulting 3-day span */}
            <p className="mb-6 text-gray-700">
              Booking window: {moment(newEvent.startDate).format("MMM DD")} -{" "}
              {moment(newEvent.startDate).add(2, "days").format("MMM DD")}
            </p>
            {/* Idealized Day Selection */}
            <div className="mb-5 text-black">
              <label className="mb-1.5 block font-bold text-gray-800">
                Select Desired Jump Day:
              </label>
              <select
                value={newEvent.idealizedDay}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    idealizedDay: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border-2 border-gray-300 p-2.5 text-sm focus:border-blue-600 focus:outline-none"
              >
                {/* Option for each day in the 3-day span, showing the actual date */}
                <option value={1}>
                  Day 1 - {moment(newEvent.startDate).format("MMM DD")}
                </option>
                <option value={2}>
                  Day 2 -{" "}
                  {moment(newEvent.startDate).add(1, "day").format("MMM DD")}
                </option>
                <option value={3}>
                  Day 3 -{" "}
                  {moment(newEvent.startDate).add(2, "days").format("MMM DD")}
                </option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5">
              <button
                className="cursor-pointer rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
                onClick={() => setShowEventForm(false)}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={createEvent}
                disabled={!newEvent.title} // Disable if no title entered
              >
                Create Event
              </button>
            </div>
          </div>
        </>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Event Details</h3>
            <div className="mb-6 space-y-3">
              <div>
                <strong>Title:</strong> {selectedEvent.title}
              </div>
              <div>
                <strong>Start:</strong>{" "}
                {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm A")}
              </div>
              <div>
                <strong>End:</strong>{" "}
                {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm A")}
              </div>
              <div>
                <strong>Resource:</strong> {selectedEvent.resource}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteEvent}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Delete Event
              </button>
              <button
                onClick={() => setShowEventModal(false)}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
