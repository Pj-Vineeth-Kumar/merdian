import { CalendarDays, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { Day } from "@shared/types";

import { IconButton } from "@/components/ui/icon-button";

import { StopList } from "./stop-list";

interface DaySectionProps {
  day: Day;
  index: number;
  destination: string;
  onReorder: (activeId: string, overId: string) => void;
  onRemoveStop: (stopId: string) => void;
  onRemoveDay: () => void;
}

export function DaySection({
  day,
  index,
  destination,
  onReorder,
  onRemoveStop,
  onRemoveDay,
}: DaySectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3"
      aria-label={`Day ${day.dayNumber}: ${day.title}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
            Day {String(day.dayNumber).padStart(2, "0")}
          </span>
          <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-balance">
            {day.title}
          </h3>
        </div>
        <IconButton
          label={`Remove day ${day.dayNumber}`}
          onClick={onRemoveDay}
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <X />
        </IconButton>
      </header>

      {day.date && (
        <p className="-mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden />
          {day.date}
        </p>
      )}

      {day.stops.length > 0 ? (
        <StopList
          stops={day.stops}
          destination={destination}
          onReorder={onReorder}
          onRemoveStop={onRemoveStop}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No stops left on this day. Remove the day, or generate a new plan.
        </p>
      )}
    </motion.section>
  );
}
