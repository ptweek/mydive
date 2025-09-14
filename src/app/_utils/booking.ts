export function getConfirmedJumpDays(booking: {
  confirmedJumpDays: unknown;
}): Date[] {
  if (!booking.confirmedJumpDays || !Array.isArray(booking.confirmedJumpDays)) {
    return [];
  }
  return booking.confirmedJumpDays.map(
    (dateStr) => new Date(dateStr as string), // ugly, sad, and the result of prisma not allowing me to create an array of native datetimes.
  );
}

export function setConfirmedJumpDays(dates: Date[]): string[] {
  return dates.map((date) => date.toISOString());
}
