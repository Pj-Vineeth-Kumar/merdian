import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { MAX_TRIP_DAYS } from "@shared/constants";
import type { DateRange } from "@shared/types";

import { Button } from "@/components/ui/button";
import {
  addDays,
  dayCount,
  fromISODate,
  isSameDay,
  MONTH_NAMES,
  monthGrid,
  startOfDay,
  toISODate,
  WEEKDAY_LABELS,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value: DateRange | null;
  onApply: (range: DateRange | null) => void;
}

interface Draft {
  start: Date | null;
  end: Date | null;
}

export function DateRangePicker({ value, onApply }: DateRangePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [draft, setDraft] = useState<Draft>(() => ({
    start: value ? fromISODate(value.start) : null,
    end: value ? fromISODate(value.end) : null,
  }));
  const [hovered, setHovered] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ? fromISODate(value.start) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const selectDay = (day: Date) => {
    setDraft((prev) => {
      if (!prev.start || prev.end) return { start: day, end: null };
      if (day < prev.start) return { start: day, end: null };
      if (dayCount(prev.start, day) > MAX_TRIP_DAYS) return { start: day, end: null };
      return { start: prev.start, end: day };
    });
  };

  const applyPreset = (start: Date, end: Date) => {
    setDraft({ start, end });
    setViewMonth(new Date(start.getFullYear(), start.getMonth(), 1));
  };

  const apply = () => {
    if (!draft.start) return;
    const end = draft.end ?? draft.start;
    onApply({ start: toISODate(draft.start), end: toISODate(end) });
  };

  const clear = () => {
    setDraft({ start: null, end: null });
    onApply(null);
  };

  const previewEnd = draft.start && !draft.end ? hovered : null;
  const summary =
    draft.start &&
    `${draft.start.toLocaleDateString("en-US", { day: "numeric", month: "short" })}` +
      (draft.end
        ? ` - ${draft.end.toLocaleDateString("en-US", { day: "numeric", month: "short" })} · ${dayCount(draft.start, draft.end)} days`
        : " · pick an end date");

  return (
    <div className="w-[min(92vw,40rem)] rounded-lg border border-border bg-popover p-4 shadow-lift">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <MonthView
              monthDate={viewMonth}
              today={today}
              draft={draft}
              previewEnd={previewEnd}
              onSelect={selectDay}
              onHover={setHovered}
              onPrev={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              showPrev
            />
            <MonthView
              monthDate={new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)}
              today={today}
              draft={draft}
              previewEnd={previewEnd}
              onSelect={selectDay}
              onHover={setHovered}
              onNext={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              showNext
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap gap-1.5 border-t border-border pt-3 sm:w-40 sm:flex-col sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
            Quick picks
          </span>
          {presets(today).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.start, preset.end)}
              className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:rounded-md sm:border-0 sm:px-2 sm:hover:bg-muted"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="tabular text-sm text-muted-foreground">{summary || "No dates selected"}</span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={!draft.start}>
            Apply dates
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MonthViewProps {
  monthDate: Date;
  today: Date;
  draft: Draft;
  previewEnd: Date | null;
  onSelect: (day: Date) => void;
  onHover: (day: Date | null) => void;
  onPrev?: () => void;
  onNext?: () => void;
  showPrev?: boolean;
  showNext?: boolean;
}

function MonthView({
  monthDate,
  today,
  draft,
  previewEnd,
  onSelect,
  onHover,
  onPrev,
  onNext,
  showPrev,
  showNext,
}: MonthViewProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const days = monthGrid(year, month);
  const rangeEnd = draft.end ?? previewEnd;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="w-8">
          {showPrev && (
            <NavButton label="Previous month" onClick={onPrev}>
              <ChevronLeft className="size-4" />
            </NavButton>
          )}
        </span>
        <span className="font-display text-sm font-semibold">
          {MONTH_NAMES[month]} {year}
        </span>
        <span className="flex w-8 justify-end">
          {showNext && (
            <NavButton label="Next month" onClick={onNext}>
              <ChevronRight className="size-4" />
            </NavButton>
          )}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
            {label}
          </span>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === month;
          const isPast = day < today;
          const disabled = isPast;
          const isStart = draft.start && isSameDay(day, draft.start);
          const isEnd = rangeEnd && isSameDay(day, rangeEnd);
          const inRange =
            draft.start && rangeEnd && day > draft.start && day < rangeEnd && day >= today;
          const isEndpoint = Boolean(isStart || isEnd);

          return (
            <div key={day.toISOString()} className="relative h-9">
              {(inRange || (isEndpoint && draft.start && rangeEnd && !isSameDay(draft.start, rangeEnd))) && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0.5 bg-primary/12",
                    inRange && "inset-x-0",
                    isStart && !inRange && "left-1/2 right-0",
                    isEnd && !inRange && "left-0 right-1/2",
                  )}
                />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                onMouseEnter={() => onHover(day)}
                aria-label={day.toLocaleDateString("en-US", { dateStyle: "full" })}
                aria-pressed={isEndpoint || undefined}
                className={cn(
                  "relative z-10 grid size-9 place-items-center rounded-full text-sm transition-colors",
                  !inMonth && "text-muted-foreground/45",
                  disabled && "cursor-not-allowed text-muted-foreground/30",
                  !disabled && !isEndpoint && "hover:bg-muted",
                  isEndpoint && "bg-primary font-semibold text-primary-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

function presets(today: Date): { label: string; start: Date; end: Date }[] {
  const dow = today.getDay();
  const upcoming = (weekday: number) => addDays(today, (weekday - dow + 7) % 7);
  const saturday = upcoming(6);
  const friday = upcoming(5);
  const monday = upcoming(1);
  return [
    { label: "This weekend", start: saturday, end: addDays(saturday, 1) },
    { label: "Long weekend", start: friday, end: addDays(friday, 2) },
    { label: "Next week", start: monday, end: addDays(monday, 6) },
    { label: "5 days", start: today, end: addDays(today, 4) },
    { label: "1 week", start: today, end: addDays(today, 6) },
    { label: "2 weeks", start: today, end: addDays(today, 13) },
  ];
}
