export function normalizeToUTCMidnight(date: string | Date): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    normalizeToUTCMidnight(date1).getTime() ===
    normalizeToUTCMidnight(date2).getTime()
  );
}
