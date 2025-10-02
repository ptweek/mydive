import { BookingZone } from "@prisma/client";

export enum BookingZoneString {
  DEFAULT = "Default",
  MAMMOTH_LAKES = "Mammoth Lakes",
}

export const BookingZoneValues = Object.values(BookingZone);

export const convertBookingZoneEnumToDisplayString = (
  bookingZone: BookingZone,
) => {
  switch (bookingZone) {
    case BookingZone.DEFAULT:
      return BookingZoneString.DEFAULT;
    case BookingZone.MAMMOTH_LAKES:
      return BookingZoneString.MAMMOTH_LAKES;
    default:
      return bookingZone;
  }
};

export const convertBookingZoneDisplayStringToBookingZoneEnum = (
  bookingZoneStr: BookingZoneString,
) => {
  switch (bookingZoneStr) {
    case BookingZoneString.DEFAULT:
      return BookingZone.DEFAULT;
    case BookingZoneString.MAMMOTH_LAKES:
      return BookingZone.MAMMOTH_LAKES;
    default:
      return bookingZoneStr;
  }
};
