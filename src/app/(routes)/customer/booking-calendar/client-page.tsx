"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer, type SlotInfo } from "react-big-calendar";
import moment from "moment";
import CalendarToolbar from "./components/calendar/components/toolbar";
import EventComponent from "./components/calendar/components/event";
import EventCreationModal from "./components/calendar/components/event-creation-modal";
import type { CalendarEvent } from "./components/calendar/types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./components/calendar/calendar-overrides.css";
import {
  findBookingByDate,
  isDateBookable,
  isDateConfirmedJumpdate,
  isDateInPast,
  isDatePartOfEvent,
  isDatePartOfYourEvent,
  isIdealizedDay,
} from "./components/calendar/helpers";
import WaitlistModal from "./components/calendar/components/waitlist-modal";
import { Button } from "@nextui-org/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { api } from "mydive/trpc/react";
import { getActiveScheduledJumpDatesFromBookingWindow } from "mydive/app/_shared-frontend/utils/booking";
import CalendarLegend from "./components/calendar/components/calendar-legend";
import { BookingZone } from "@prisma/client";
import { normalizeToUTCMidnight } from "mydive/server/utils/dates";

const localizer = momentLocalizer(moment);

export default function CalendarClientPage({ userId }: { userId: string }) {
  const router = useRouter();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [newEvent, setNewEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedWaitlistDate, setSelectedWaitlistDate] = useState<Date | null>(
    null,
  );
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );

  const { data, isLoading } = api.bookingWindow.getBookings.useQuery(
    {
      status: { notIn: ["CANCELED", "PENDING_DEPOSIT"] },
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
      gcTime: 0,
    },
  );

  const createBookingMutation =
    api.customerBookingManager.createBookingWindow.useMutation({
      onSuccess: () => {
        setShowSuccessAlert(true);
      },
      onError: (error) => {
        console.error("Failed to create booking:", error);
        alert("Error submitting booking. Please try again.");
      },
    });

  useEffect(() => {
    if (data && !isLoading) {
      const transformedEvents: CalendarEvent[] = data.bookings.map(
        (booking) => {
          const confirmedJumpDates = booking?.scheduledJumpDates
            ? getActiveScheduledJumpDatesFromBookingWindow(booking)
            : undefined;
          return {
            start: new Date(booking.windowStartDate),
            end: new Date(booking.windowEndDate),
            idealizedDay: new Date(booking.idealizedJumpDate),
            numJumpers: booking.numJumpers,
            bookedBy: booking.bookedBy,
            bookingZone: booking.bookingZone,
            resource: "custom-3day",
            confirmedJumpDays: confirmedJumpDates,
          };
        },
      );
      setEvents(transformedEvents);
    }
  }, [data, isLoading]);

  const clearNewBooking = () => {
    setNewEvent(null);
  };

  const handleSelectSlot = (slotInfo: SlotInfo, userId: string) => {
    if (!!newEvent) {
      return;
    }
    if (
      isIdealizedDay(slotInfo.start, events) ||
      isDatePartOfYourEvent(slotInfo.start, events, userId) ||
      isDateInPast(slotInfo.start)
    ) {
      return;
    }
    if (
      !isIdealizedDay(slotInfo.start, events) &&
      isDatePartOfEvent(slotInfo.start, events) &&
      !isDateConfirmedJumpdate(slotInfo.start, events)
    ) {
      const associatedBookingId = findBookingByDate(
        slotInfo.start,
        data?.bookings ?? [],
      )?.id;
      if (associatedBookingId && associatedBookingId !== null) {
        setSelectedWaitlistDate(slotInfo.start);
        setSelectedBookingId(associatedBookingId);
        setShowWaitlistForm(true);
      } else {
        throw Error(`Could not find associated booking for that waitlist date`);
      }
    }
    if (isDateBookable(slotInfo.start, events)) {
      setNewEvent({
        start: slotInfo.start,
        idealizedDay: slotInfo.start,
        numJumpers: 1,
        bookingZone: BookingZone.DEFAULT,
      });
      setShowEventForm(true);
    }
  };
  const handleCheckoutClick = async (bookingWindow: CalendarEvent) => {
    if (!bookingWindow) return;
    try {
      if (!bookingWindow.start) {
        throw new Error("Invalid new event");
      }
      const windowStartDay = new Date(bookingWindow.start);
      const windowEndDate = new Date(windowStartDay);
      windowEndDate.setDate(windowEndDate.getDate() + 2);
      const result = await createBookingMutation.mutateAsync({
        numJumpers: bookingWindow.numJumpers,
        windowStartDate: windowStartDay,
        windowEndDate: windowEndDate,
        idealizedJumpDay: new Date(bookingWindow.idealizedDay),
        createdById: userId,
        bookingZone: bookingWindow.bookingZone,
      });
      router.push(`/customer/payments/${result.id}`);
    } catch (error) {
      alert("Error submitting booking. Please try again.");
    }
  };

  const createEvent = () => {
    if (!newEvent) {
      return;
    }
    setEvents([...events]);
    setShowEventForm(false);
  };

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const dayPropGetter = useCallback(
    (day: Date) => {
      const date = normalizeToUTCMidnight(day);
      const unbookableStyling = {
        style: {
          background:
            "repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #f1f5f9 2px, #f1f5f9 6px)",
          opacity: 0.9,
          pointerEvents: "none" as const,
        },
      };

      if (isLoading) {
        return unbookableStyling;
      }
      const isPastDate = isDateInPast(date);
      if (isPastDate) {
        return unbookableStyling;
      }
      const isConfirmedJumpDate = isDateConfirmedJumpdate(date, events);

      if (isConfirmedJumpDate) {
        const confirmedJumpEvent = events.find((event) =>
          event.confirmedJumpDays?.some((jumpDay) =>
            moment.utc(jumpDay).isSame(moment(date), "day"),
          ),
        );
        const isUserConfirmedJump = confirmedJumpEvent?.bookedBy === userId;

        return {
          style: {
            backgroundColor: "#fecaca",
            fontWeight: "700",
            color: "#dc2626",
            position: "relative" as const,
            boxShadow: isUserConfirmedJump
              ? "0 2px 4px rgba(0, 0, 0, 0.1)"
              : "none",
          },
          className: isUserConfirmedJump
            ? "user-booking confirmed-jump-day"
            : "confirmed-jump-day",
        };
      }

      if (newEvent) {
        const newEventStart = moment.utc(newEvent.start);
        const newEventEnd = moment.utc(newEvent.start).add(3, "days");
        const checkDate = moment.utc(date);

        if (checkDate.isBetween(newEventStart, newEventEnd, "day", "[)")) {
          const isNewEventIdealizedDay = moment
            .utc(date)
            .isSame(moment.utc(newEvent.idealizedDay), "day");

          if (isNewEventIdealizedDay) {
            return {
              style: {
                background: "#86efac",
                fontWeight: "700",
                opacity: 1,
              },
            };
          } else {
            return {
              style: {
                backgroundColor: "#dcfce7",
                fontWeight: "700",
                opacity: 0.8,
                textDecoration: "line-through",
              },
            };
          }
        }
      }

      const maybeEvent = events.find((event) => {
        return (
          moment.utc(event.start).isSame(moment(date), "day") ||
          moment
            .utc(event.start)
            .isSame(moment(date).subtract(1, "day"), "day") ||
          moment.utc(event.start).isSame(moment(date).subtract(2, "day"), "day")
        );
      });

      if (maybeEvent) {
        const isIdealizedDay = moment
          .utc(date)
          .isSame(moment.utc(maybeEvent.idealizedDay), "day");
        const isUserBooking = maybeEvent.bookedBy === userId;

        const baseStyle = {
          fontWeight: isIdealizedDay ? "700" : "600",
          borderRadius: "4px",
          position: "relative" as const,
        };

        if (isIdealizedDay) {
          return {
            style: {
              ...baseStyle,
              backgroundColor: "#fecaca",
              boxShadow: isUserBooking
                ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                : "none",
            },
            className: isUserBooking
              ? "user-booking idealized-day"
              : "idealized-day",
          };
        } else {
          return {
            style: {
              ...baseStyle,
              backgroundColor: "#fef3c7",
              boxShadow: isUserBooking
                ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                : "none",
            },
            className: isUserBooking ? "user-booking event-day" : "event-day",
          };
        }
      }

      const isBookable = isDateBookable(date, events);

      if (!isBookable) {
        return {
          style: {
            background:
              "repeating-linear-gradient(45deg, #ffffff, #ffffff 2px, #f1f5f9 2px, #f1f5f9 6px)",
            color: "#64748b",
            opacity: 0.9,
            textDecoration: "line-through",
          },
        };
      }

      return {};
    },
    [events, isLoading, newEvent, userId],
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <CalendarLegend />

      {/* Calendar takes remaining space */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg bg-white p-2 text-black shadow-lg">
        <div className="flex h-full flex-col">
          {/* Calendar component takes available space */}
          <div className="flex-1" style={{ touchAction: "manipulation" }}>
            <Calendar
              localizer={localizer}
              longPressThreshold={1}
              events={[]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectSlot={(slotInfo) => {
                handleSelectSlot(slotInfo, userId);
              }}
              selectable={true}
              dayPropGetter={dayPropGetter}
              components={{
                toolbar: CalendarToolbar,
                event: EventComponent,
              }}
              views={["month"]}
              step={60}
              showMultiDayTimes
            />
          </div>

          {/* Fixed height buttons at bottom */}
          <div className="mt-4 flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
            <Button
              size="lg"
              variant="shadow"
              disabled={!newEvent}
              onPress={clearNewBooking}
              className={clsx(
                "w-full px-3 py-3 text-sm font-semibold tracking-wider uppercase transition-all duration-200 sm:w-auto sm:text-lg",
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
              onPress={async () => {
                if (!newEvent) return;
                await handleCheckoutClick(newEvent);
              }}
              className={clsx(
                "w-full px-3 py-3 text-sm font-semibold tracking-wider uppercase transition-all duration-200 sm:w-auto sm:text-lg",
                !newEvent
                  ? "cursor-not-allowed bg-gray-400 text-gray-200 shadow-none hover:bg-gray-400 hover:shadow-none"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30",
              )}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Modals remain the same */}
      {showEventForm && newEvent && (
        <EventCreationModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          setShowEventForm={setShowEventForm}
          createEvent={createEvent}
        />
      )}
      {showWaitlistForm && selectedWaitlistDate && selectedBookingId && (
        <WaitlistModal
          day={selectedWaitlistDate}
          associatedBookingId={selectedBookingId}
          isOpen={showWaitlistForm}
          onClose={() => {
            setSelectedWaitlistDate(null);
            setSelectedBookingId(null);
            setShowWaitlistForm(false);
          }}
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
                  Redirecting to booking review and payment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
