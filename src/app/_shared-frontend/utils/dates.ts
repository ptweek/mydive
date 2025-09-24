export function isDateTodayOrPast(date: Date): boolean {
  const today = new Date();

  // Set time to start of day for accurate comparison
  const todayStartOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateStartOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return dateStartOfDay <= todayStartOfDay;
}
