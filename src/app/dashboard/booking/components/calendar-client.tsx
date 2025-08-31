"use client";

import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

const CustomEvent = ({ event }) => {
  return <div style={{ height: "100%", width: "100%" }}></div>;
};

export default function SchedulingCalendar() {
  const [events, setEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Handle selecting a time slot to create new event
  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt("Enter event title:");
      if (title) {
        const newEvent = {
          id: events.length + 1,
          title,
          start,
          end,
          resource: "default",
        };
        setEvents((prev) => [...prev, newEvent]);
      }
    },
    [events],
  );

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

  // Custom event component styling
  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = "#3174ad";

    // Color code events by resource/type
    switch (event.resource) {
      default:
        backgroundColor = "#fbbf24";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.5, // Changed from 1 to fully opaque
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "0.875rem",
        height: "100%", // Make it take full height
        minHeight: "60px", // Ensure minimum height
        padding: "8px", // Add more padding
        fontWeight: "600", // Make text bolder
        textAlign: "center", // Center the text
        lineHeight: "1.2", // Better line spacing
      },
    };
  };

  const CustomToolbar = ({ label, onNavigate, onView, view, date }) => {
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

    const handleDateSelect = (event) => {
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
            onClick={() => onNavigate("TODAY")}
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
                  ?.value.toISOString() || dateOptions[0]?.value.toISOString()
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
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Scheduling Calendar</h1>
        <p className="text-white">
          Book an isolated three day window, or hop on the waitlist.
        </p>
      </div>

      {/* Calendar */}
      <div
        style={{ height: "600px" }}
        className="rounded-lg bg-white p-4 text-black shadow-lg"
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          popup={true}
          // eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          defaultView="month"
          step={30}
          timeslots={2}
          defaultDate={new Date(2025, 8, 1)} // September 1, 2025
          min={new Date(0, 0, 0, 8, 0)} // 8 AM
          max={new Date(0, 0, 0, 18, 0)} // 6 PM
        />
      </div>

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
