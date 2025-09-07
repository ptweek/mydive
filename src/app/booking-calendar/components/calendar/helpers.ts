import moment from "moment";
import type { CalendarEvent } from "./types";

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
