import type { DateRange } from "@shared/types";

/** Local calendar helpers. All dates are treated at day granularity (no time). */

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Serialize to "YYYY-MM-DD" (no timezone shift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Inclusive day count between two dates. */
export function dayCount(start: Date, end: Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000) + 1;
}

const DAY = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });
const DAY_YEAR = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

/** "6 – 11 Aug" or "28 Dec – 3 Jan 2027" for a range. */
export function formatRangeLabel(range: DateRange): string {
  const start = fromISODate(range.start);
  const end = fromISODate(range.end);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = sameYear ? DAY.format(start) : DAY_YEAR.format(start);
  const endLabel = DAY_YEAR.format(end);
  return `${startLabel} - ${endLabel}`;
}

/**
 * A 6-row month grid (Sunday-first) including trailing/leading days from adjacent
 * months, so every calendar renders a stable 6x7 shape.
 */
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const gridStart = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
