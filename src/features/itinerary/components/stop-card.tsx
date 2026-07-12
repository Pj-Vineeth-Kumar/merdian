import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Lightbulb, MapPin, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

import type { Stop } from "@shared/types";

import { IconButton } from "@/components/ui/icon-button";
import { cn, formatDuration } from "@/lib/utils";

import { categoryMeta, timeOfDayIcon } from "./category-icon";

interface StopCardProps {
  stop: Stop;
  onRemove: () => void;
}

export function StopCard({ stop, onRemove }: StopCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const reduceMotion = useReducedMotion();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
  });

  const meta = categoryMeta(stop.category);
  const Icon = meta.icon;
  const TimeIcon = stop.timeOfDay ? timeOfDayIcon(stop.timeOfDay) : null;
  const duration = formatDuration(stop.durationMinutes);
  const hasDetails = Boolean(stop.description || stop.tip || stop.location || stop.cost);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative rounded-lg border border-border bg-card shadow-card transition-shadow",
        isDragging && "z-20 shadow-lift",
      )}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          aria-label={`Drag to reorder ${stop.name}`}
          className="flex touch-none items-center rounded-l-lg px-1.5 text-muted-foreground/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:cursor-grabbing cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => hasDetails && setExpanded((v) => !v)}
          aria-expanded={hasDetails ? expanded : undefined}
          aria-controls={hasDetails ? detailsId : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 py-3 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            !hasDetails && "cursor-default",
          )}
        >
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-md bg-muted/70", meta.color)}>
            <Icon className="size-[18px]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium leading-snug">{stop.name}</span>
            <span className="tabular mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
              <span className="text-foreground/70">{meta.label}</span>
              {stop.timeOfDay && TimeIcon && (
                <span className="inline-flex items-center gap-1 capitalize">
                  <TimeIcon className="size-3" aria-hidden />
                  {stop.timeOfDay}
                </span>
              )}
              {duration && <span>{duration}</span>}
              {stop.cost && <span>{stop.cost === "free" ? "Free" : stop.cost}</span>}
            </span>
          </span>
          {hasDetails && (
            <ChevronDown
              aria-hidden
              className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
            />
          )}
        </button>

        <div className="flex items-center pr-1.5">
          <IconButton label={`Remove ${stop.name}`} onClick={onRemove} className="size-8 text-muted-foreground hover:text-destructive">
            <Trash2 />
          </IconButton>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasDetails && (
          <motion.div
            id={detailsId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 border-t border-border px-4 py-3 pl-[3.4rem] text-sm">
              {stop.description && <p className="text-pretty text-muted-foreground">{stop.description}</p>}
              {stop.location && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-cat-sight" aria-hidden />
                  {stop.location}
                </p>
              )}
              {stop.tip && (
                <p className="flex items-start gap-1.5 rounded-md bg-primary/10 px-2.5 py-2 text-foreground/90">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="text-pretty">{stop.tip}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
