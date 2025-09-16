import moment from "moment";
import type { CalendarEvent } from "./types";
import type { BookingWindow } from "@prisma/client";

export const isDateBookable = (date: Date, events: CalendarEvent[]) => {
  const checkDate = moment(date);

  const day1 = checkDate.clone();
  const day2 = checkDate.clone().add(1, "day");
  const day3 = checkDate.clone().add(2, "day");

  return !(
    isDatePartOfEvent(day1.toDate(), events) ||
    isDatePartOfEvent(day2.toDate(), events) ||
    isDatePartOfEvent(day3.toDate(), events)
  );
};

export const isDateInPast = (date: Date) => {
  return moment(date).isBefore(moment(), "day");
};

export const findBookingByDate = (date: Date, bookings: BookingWindow[]) => {
  return bookings.find((booking) => {
    const bookingStart = moment(booking.windowStartDate);
    const bookingEnd = moment(booking.windowEndDate);
    const target = moment(date);

    // Check if target date is between start and end (inclusive)
    return target.isBetween(bookingStart, bookingEnd, "day", "[]");
  });
};

// Helper function to check if a date is part of an existing event
export const isDatePartOfEvent = (
  date: Date,
  events: CalendarEvent[],
): boolean => {
  const checkDate = moment(date);

  return events.some((event) => {
    const eventStart = moment(event.start);
    const eventEnd = moment(event.end);
    // Check if the date falls within the event's range
    return checkDate.isBetween(eventStart, eventEnd, "day", "[]");
  });
};

export const isDatePartOfYourEvent = (
  date: Date,
  events: CalendarEvent[],
  userId: string,
): boolean => {
  const checkDate = moment(date);

  return events.some((event) => {
    const eventStart = moment(event.start);
    const eventEnd = moment(event.end);
    // Check if the date falls within the event's range
    return (
      checkDate.isBetween(eventStart, eventEnd, "day", "[]") &&
      event.bookedBy === userId
    );
  });
};

export const isDateConfirmedJumpdate = (
  date: Date,
  events: CalendarEvent[],
): boolean => {
  return events.some((event) =>
    event.confirmedJumpDays?.some((jumpDay) =>
      moment(jumpDay).isSame(moment(date), "day"),
    ),
  );
};

// Helper function to check if a date is an idealized day
export const isIdealizedDay = (
  date: Date,
  events: CalendarEvent[],
): boolean => {
  const checkDate = moment(date);

  return events.some((event) => {
    return checkDate.isSame(moment(event.idealizedDay), "day");
  });
};
