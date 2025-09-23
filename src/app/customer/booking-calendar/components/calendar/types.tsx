import { type Event } from "react-big-calendar";

export type CalendarEvent = Event & {
  idealizedDay: Date;
  numJumpers: number;
  bookedBy?: string;
  confirmedJumpDays?: Date[];
};
