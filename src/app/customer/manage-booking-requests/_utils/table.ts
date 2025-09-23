import type {
  BookingWindowPopulatedDto,
  WaitlistEntryPopulatedDto,
} from "mydive/server/api/routers/types";

export function isBookingWindowPopulatedDto(
  data: BookingWindowPopulatedDto | WaitlistEntryPopulatedDto,
): data is BookingWindowPopulatedDto {
  return (
    data &&
    typeof data === "object" &&
    "windowStartDate" in data &&
    "windowEndDate" in data
  );
}

export function isWaitlistEntryPopulatedDto(
  data: BookingWindowPopulatedDto | WaitlistEntryPopulatedDto,
): data is WaitlistEntryPopulatedDto {
  // Add your specific validation logic here based on WaitlistEntryPopulatedDto structure
  // This is a placeholder - replace with actual property checks
  return data && typeof data === "object" && "latestPosition" in data;
}
