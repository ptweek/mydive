"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Calendar,
  momentLocalizer,
  type NavigateAction,
  type SlotInfo,
} from "react-big-calendar";
import moment from "moment";
import CalendarToolbar from "./components/toolbar";
import EventComponent from "./components/event";
import CalendarLegend from "./components/calendar-legend";
import EventCreationModal from "./components/event-creation-modal";
import type { CalendarEvent } from "./types";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-overrides.css"; // Add this line
import { isDateBookable, isDatePartOfEvent, isIdealizedDay } from "./helpers";
import WaitlistModal from "./components/waitlist-modal";
import { Button } from "@nextui-org/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { api } from "mydive/trpc/react";
import type { User } from "@clerk/backend";

// Setup the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

export default function SchedulingCalendar({ userId }: { userId: string }) {
  const router = useRouter();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [newEvent, setNewEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const { data, isLoading } = api.booking.getBookings.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Data is immediately considered stale
    gcTime: 0, // Don't cache the data
  });
  const createBookingMutation = api.booking.createBooking.useMutation({
    onSuccess: () => {
      // Invalidate and refetch bookings after successful creation
      // Show nice success alert
      setShowSuccessAlert(true);
      // Wait 2 seconds, then navigate
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      console.error("Failed to create booking:", error);
      alert("Error submitting booking. Please try again.");
    },
  });

  useEffect(() => {
    if (data && !isLoading) {
      // Transform your API data into CalendarEvent format
      const transformedEvents: CalendarEvent[] = data.bookings.map(
        (booking) => ({
          start: new Date(booking.windowStartDay), // assuming your API returns startDate
          end: new Date(booking.windowEndDate), // assuming your API returns endDate
          idealizedDay: new Date(booking.idealizedJumpDay),
          numJumpers: booking.numJumpers,
          resource: "custom-3day",
          // Add any other properties you need from your booking data
        }),
      );

      setEvents(transformedEvents);
    }
  }, [data, isLoading]);
  const clearNewBooking = () => {
    setNewEvent(null);
  };
  const handleBookNow = async () => {
    if (!newEvent) return;
    try {
      if (!newEvent.start) {
        throw new Error("Invalid new event");
      }
      const windowStartDay = new Date(newEvent.start);
      const windowEndDate = new Date(windowStartDay);
      windowEndDate.setDate(windowEndDate.getDate() + 2);

      console.log({
        numJumpers: newEvent.numJumpers,
        windowStartDay: windowStartDay,
        windowEndDate: windowEndDate,
        idealizedJumpDay: new Date(newEvent.idealizedDay),
      });

      // Create the booking using the tRPC mutation
      createBookingMutation.mutate({
        numJumpers: newEvent.numJumpers,
        windowStartDay: windowStartDay,
        windowEndDate: windowEndDate,
        idealizedJumpDay: new Date(newEvent.idealizedDay),
        createdById: userId,
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Error submitting booking. Please try again.");
    }
  };
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Only allow for the creation of one event
    if (!!newEvent) {
      return;
    }
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
    setEvents([...events]); // hacky, needs fix
    setShowEventForm(false);
  };
  const handleNavigate = useCallback(
    (newDate: Date, view?: string, action?: NavigateAction) => {
      setCurrentDate(newDate);
    },
    [],
  );
  const dayPropGetter = useCallback(
    (date: Date) => {
      if (isLoading) {
        return {
          style: {
            background:
              "repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #f1f5f9 2px, #f1f5f9 6px)",
            opacity: 0.9,
            pointerEvents: "none", // Disable interactions
          },
        };
      }

      if (newEvent) {
        const newEventStart = moment(newEvent.start);
        const newEventEnd = moment(newEvent.start).add(3, "days");
        const checkDate = moment(date);

        // Check if current date falls within the newEvent's 3-day range
        if (checkDate.isBetween(newEventStart, newEventEnd, "day", "[)")) {
          const isNewEventIdealizedDay = moment(date).isSame(
            moment(newEvent.idealizedDay),
            "day",
          );

          if (isNewEventIdealizedDay) {
            // GREEN for new event's idealized day with diagonal stripes and strikethrough
            return {
              style: {
                background:
                  "repeating-linear-gradient(45deg, #dcfce7, #dcfce7 2px, #bbf7d0 2px, #bbf7d0 6px)",
                fontWeight: "700",
                textDecoration: "line-through", // Strikethrough to show it's the idealized day
                opacity: 0.8, // Slightly transparent
              },
            };
          } else {
            // LIGHTER GREEN for other new event days with diagonal stripes (no strikethrough)
            return {
              style: {
                backgroundColor: "#dcfce7",
                fontWeight: "700",
                opacity: 0.8, // Slightly transparent
                textDecoration: "line-through", // Strikethrough to show it's the idealized day
              },
            };
          }
        }
      }

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
    },
    [events, isLoading, newEvent],
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
        <div className="mt-4 flex justify-end space-x-3">
          <Button
            size="lg"
            variant="shadow"
            disabled={!newEvent}
            onPress={clearNewBooking}
            className={clsx(
              "px-3 py-3 text-lg font-semibold tracking-wider uppercase transition-all duration-200",
              !newEvent
                ? "cursor-not-allowed bg-gray-400 text-gray-200 shadow-none hover:bg-gray-400 hover:shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30",
            )}
          >
            Clear booking
          </Button>
          <Button
            size="lg"
            variant="shadow"
            disabled={!newEvent}
            onPress={handleBookNow}
            className={clsx(
              "px-3 py-3 text-lg font-semibold tracking-wider uppercase transition-all duration-200",
              !newEvent
                ? "cursor-not-allowed bg-gray-400 text-gray-200 shadow-none hover:bg-gray-400 hover:shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30",
            )}
          >
            Book Now
          </Button>
        </div>
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

      {showSuccessAlert && (
        <div className="animate-in slide-in-from-right fixed top-20 right-4 z-[9999] duration-300">
          <div className="rounded-lg border border-green-400 bg-green-500 px-6 py-4 text-white shadow-2xl">
            <div className="flex items-center">
              <svg
                className="mr-3 h-6 w-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h4 className="font-semibold">Booking Submitted!</h4>
                <p className="text-sm text-green-100">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
