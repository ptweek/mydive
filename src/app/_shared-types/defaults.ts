import { BookingZone, SchedulingMethod } from "@prisma/client";

export enum BookingZoneString {
  DEFAULT = "Default",
  MAMMOTH = "Mammoth, CA",
  LAKE_ISABELLA = "Lake Isabelle, CA",
  MOUNT_SHASTA = "Mt. Shasta, CA",
  GOLD_BEACH = "Gold Beach, OR",
  CRATER_LAKE = "Crater Lake, OR",
  LEAVENWORTH = "Leavenworth, WA",
  MOUNT_RAINIER_FOOTHILLS = "Mt. Rainier Foothills, WA",
  SUN_VALLEY = "Sun Valley, ID",
  JACKSON_HOLE = "Jackson Holes, WY",
  BIG_SKY = "Big Sky, MT",
  MOAB = "Moab, UT",
  ZION = "Zion, UT",
  PAGE = "Page, AZ",
  FLORIDA_KEYS = "Florida Keys, FL",
  OUTER_BANKS = "Outer Banks, NC",
}

export const BookingZoneValues = Object.values(BookingZone);

export const convertBookingZoneEnumToDisplayString = (
  bookingZone: BookingZone,
) => {
  switch (bookingZone) {
    case BookingZone.DEFAULT:
      return BookingZoneString.DEFAULT;
    case BookingZone.MAMMOTH:
      return BookingZoneString.MAMMOTH;
    case BookingZone.LAKE_ISABELLA:
      return BookingZoneString.LAKE_ISABELLA;
    case BookingZone.MOUNT_SHASTA:
      return BookingZoneString.MOUNT_SHASTA;
    case BookingZone.GOLD_BEACH:
      return BookingZoneString.GOLD_BEACH;
    case BookingZone.CRATER_LAKE:
      return BookingZoneString.CRATER_LAKE;
    case BookingZone.LEAVENWORTH:
      return BookingZoneString.LEAVENWORTH;
    case BookingZone.MOUNT_RAINIER_FOOTHILLS:
      return BookingZoneString.MOUNT_RAINIER_FOOTHILLS;
    case BookingZone.SUN_VALLEY:
      return BookingZoneString.SUN_VALLEY;
    case BookingZone.JACKSON_HOLE:
      return BookingZoneString.JACKSON_HOLE;
    case BookingZone.BIG_SKY:
      return BookingZoneString.BIG_SKY;
    case BookingZone.MOAB:
      return BookingZoneString.MOAB;
    case BookingZone.ZION:
      return BookingZoneString.ZION;
    case BookingZone.PAGE:
      return BookingZoneString.PAGE;
    case BookingZone.FLORIDA_KEYS:
      return BookingZoneString.FLORIDA_KEYS;
    case BookingZone.OUTER_BANKS:
      return BookingZoneString.OUTER_BANKS;
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
    case BookingZoneString.MAMMOTH:
      return BookingZone.MAMMOTH;
    case BookingZoneString.LAKE_ISABELLA:
      return BookingZone.LAKE_ISABELLA;
    case BookingZoneString.MOUNT_SHASTA:
      return BookingZone.MOUNT_SHASTA;
    case BookingZoneString.GOLD_BEACH:
      return BookingZone.GOLD_BEACH;
    case BookingZoneString.CRATER_LAKE:
      return BookingZone.CRATER_LAKE;
    case BookingZoneString.LEAVENWORTH:
      return BookingZone.LEAVENWORTH;
    case BookingZoneString.MOUNT_RAINIER_FOOTHILLS:
      return BookingZone.MOUNT_RAINIER_FOOTHILLS;
    case BookingZoneString.SUN_VALLEY:
      return BookingZone.SUN_VALLEY;
    case BookingZoneString.JACKSON_HOLE:
      return BookingZone.JACKSON_HOLE;
    case BookingZoneString.BIG_SKY:
      return BookingZone.BIG_SKY;
    case BookingZoneString.MOAB:
      return BookingZone.MOAB;
    case BookingZoneString.ZION:
      return BookingZone.ZION;
    case BookingZoneString.PAGE:
      return BookingZone.PAGE;
    case BookingZoneString.FLORIDA_KEYS:
      return BookingZone.FLORIDA_KEYS;
    case BookingZoneString.OUTER_BANKS:
      return BookingZone.OUTER_BANKS;
    default:
      return bookingZoneStr;
  }
};

export const convertSchedulingMethodToDisplayString = (
  schedulingMethod: SchedulingMethod,
) => {
  switch (schedulingMethod) {
    case SchedulingMethod.BOOKING_WINDOW:
      return "Booking Window";
    case SchedulingMethod.WAITLIST:
      return "Waitlist";
    default:
      return schedulingMethod;
  }
};
