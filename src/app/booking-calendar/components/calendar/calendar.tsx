"use client";

import React, { useState, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  type Event,
  type NavigateAction,
  type SlotInfo,
} from "react-big-calendar";
import moment from "moment";
import CalendarToolbar from "./toolbar";
import EventComponent from "./event";
import CalendarLegend from "./calendar-legend";
import EventCreationModal from "./event-creation-modal";
import type { CalendarEvent } from "./types";

import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export default function SchedulingCalendar() {
  // States
  const [selectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      start: new Date(2025, 8, 15), // September 15 (start of 3-day period)
      end: new Date(2025, 8, 18), // September 18 (exclusive end - so event shows 15,16,17)
      idealizedDay: new Date(2025, 8, 15), // September 16 (the special day within the 3-day span)
      resource: { type: "custom-3day" }, // Custom metadata to identify our special event type
    },
  ]);
  console.log("events", events);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNavigate = useCallback(
    (newDate: Date, view?: string, action?: NavigateAction) => {
      console.log("Navigation triggered:", { newDate, view, action });
      setCurrentDate(newDate);
    },
    [],
  );

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setNewEvent({ start: slotInfo.start, idealizedDay: slotInfo.start }); // Store the selected date
    setShowEventForm(true); // Open the modal
  };

  const createEvent = () => {
    if (!newEvent) {
      return;
    }
    // Calculate the 3-day span using moment.js
    const startDate = moment(newEvent.start);
    const endDate = moment(startDate).add(3, "days"); // Add 3 days for the span

    // Calculate which specific day within the span is idealized
    // idealizedDay is 1-indexed (1, 2, or 3), so subtract 1 for 0-indexed addition

    // Create the event object that matches Big React Calendar's expected format
    const event: CalendarEvent = {
      start: startDate.toDate(), // Convert moment back to JavaScript Date object
      end: endDate.toDate(),
      idealizedDay: newEvent.idealizedDay, // Our custom field for the special day
      resource: { type: "custom-3day" }, // Metadata to identify our custom event type
    };

    // Add the new event to the existing events array
    setEvents([...events, event]);

    // Close the modal and reset the form
    setShowEventForm(false);
    setNewEvent(null);
  };

  // STYLING FUNCTION: Defines how events should look on the calendar
  const eventPropGetter = (event: Event) => {
    // Check if this is one of our custom 3-day events
    const type = (event.resource as unknown as { type: string }).type;
    if (type === "custom-3day") {
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

  const dayPropGetter = useCallback(
    (date: Date) => {
      // Check if this date has any events
      const maybeEvent = events.find((event) => {
        return (
          moment(event.start).isSame(moment(date), "day") ||
          moment(event.start).isSame(moment(date).subtract(1, "day"), "day") ||
          moment(event.start).isSame(moment(date).subtract(2, "day"), "day")
        );
      });

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
          // CRITICAL: Add these props to make Calendar controlled
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
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

      {showEventForm && newEvent && (
        <EventCreationModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          setShowEventForm={setShowEventForm}
          createEvent={createEvent}
        />
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
