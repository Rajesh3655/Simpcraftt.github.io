export const INDIA_TIME_ZONE = "Asia/Kolkata";

function dateFrom(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatIndiaDateTime(value) {
  const date = dateFrom(value);
  if (!date) return value ? String(value) : "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: INDIA_TIME_ZONE,
  }).format(date);
}

export function isSameIndiaDay(value, comparison = new Date()) {
  const date = dateFrom(value);
  const current = dateFrom(comparison);
  if (!date || !current) return false;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date) === formatter.format(current);
}
