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
import { isDateBookable, isDatePartOfEvent, isIdealizedDay } from "./helpers";
import WaitlistModal from "./waitlist-modal";

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export default function SchedulingCalendar() {
  const [newEvent, setNewEvent] = useState<CalendarEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      start: new Date(2025, 8, 15),
      end: new Date(2025, 8, 18),
      idealizedDay: new Date(2025, 8, 15),
      numJumpers: 1,
      resource: { type: "custom-3day" },
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
    if (isIdealizedDay(slotInfo.start, events)) {
      return;
    }
    if (
      !isIdealizedDay(slotInfo.start, events) &&
      isDatePartOfEvent(slotInfo.start, events)
    ) {
      setShowWaitlistForm(true);
    }
    if (isDateBookable(slotInfo.start, events)) {
      setNewEvent({
        start: slotInfo.start,
        idealizedDay: slotInfo.start,
        numJumpers: 1,
      });
      setShowEventForm(true);
    }
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
      numJumpers: 1,
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
      {showWaitlistForm && (
        <WaitlistModal
          isOpen={showWaitlistForm}
          onClose={() => setShowWaitlistForm(false)}
        />
      )}
    </div>
  );
}
