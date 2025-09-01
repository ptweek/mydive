"use client";

import React, { useState, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
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
import "./calendar-overrides.css"; // Add this line

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export default function SchedulingCalendar() {
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

  const isDateBookable = (date: Date, events: CalendarEvent[]) => {
    const checkDate = moment(date);
    const day1 = checkDate.clone();
    const day2 = checkDate.clone().add(1, "day");
    const day3 = checkDate.clone().add(2, "day");

    // Check if any existing event conflicts with this 3-day span
    return !events.some((event) => {
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);

      // Check if any of our 3 days fall within an existing event's range
      return (
        day1.isBetween(eventStart, eventEnd, "day", "[)") ||
        day2.isBetween(eventStart, eventEnd, "day", "[)") ||
        day3.isBetween(eventStart, eventEnd, "day", "[)")
      );
    });
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

              fontWeight: "700",
            },
          };
        } else {
          // YELLOW for other event days (not idealized)
          return {
            style: {
              backgroundColor: "#fef3c7", // Light yellow background

              fontWeight: "600",
            },
          };
        }
      }
      // Check if this day is bookable (no events in this day + next 2 days)
      const isBookable = isDateBookable(date, events);

      if (!isBookable) {
        // Subtle diagonal stripe pattern for non-bookable days
        return {
          style: {
            background:
              "repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #f1f5f9 2px, #f1f5f9 6px)",
            color: "#64748b", // Slate gray text
            opacity: 0.9,
            textDecoration: "line-through", // Add strikethrough for extra visual indication
          },
        };
      }

      return {}; // No styling for days without events

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
    </div>
  );
}
