import { MAX_TRIP_DAYS } from "@shared/constants";
import type { DateRange } from "@shared/schemas/api";

/** Parse a "YYYY-MM-DD" string into a local Date at noon (avoids TZ off-by-one). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12);
}

/** Inclusive number of days in a range, clamped to [1, MAX_TRIP_DAYS]. */
export function rangeDayCount(range: DateRange): number {
  const start = parseISODate(range.start);
  const end = parseISODate(range.end);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(diff, 1), MAX_TRIP_DAYS);
}

const LABEL_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** A human label for day `offset` after the range start, e.g. "Tue, May 6". */
export function dayLabel(range: DateRange, offset: number): string {
  const date = parseISODate(range.start);
  date.setDate(date.getDate() + offset);
  return LABEL_FORMAT.format(date);
}
