import { CalendarDays, Compass } from "lucide-react";
import type { ReactNode } from "react";

import type { DateRange } from "@shared/types";

import { EmptyResultState, ErrorState, ItineraryView } from "@/features/itinerary";
import type { ItineraryState, TripSession } from "@/features/planner";
import { formatRangeLabel } from "@/lib/dates";

interface PlanThreadProps {
  /** Loading is handled by the page (a home-like screen); this renders results. */
  state: Extract<ItineraryState, { kind: "error" | "ready" }>;
  dateRange: DateRange | null;
  onRetry: () => void;
  onReset: () => void;
  onEdit: (session: Omit<TripSession, "savedAt">) => void;
}

/**
 * Renders a completed generation as a chat exchange: the user's request as a
 * message, and the plan as the assistant's reply. The reply is fully interactive
 * structured UI (never raw model text), with each place linking to Google Maps.
 */
export function PlanThread({ state, dateRange, onRetry, onReset, onEdit }: PlanThreadProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      <UserMessage prompt={state.prompt} dateRange={dateRange} />

      <AssistantMessage>
        {state.kind === "error" && <ErrorState error={state.error} onRetry={onRetry} />}
        {state.kind === "ready" && isEmpty(state.itinerary.days) && (
          <EmptyResultState onRetry={onRetry} />
        )}
        {state.kind === "ready" && !isEmpty(state.itinerary.days) && (
          <div className="flex flex-col gap-5">
            <p className="text-pretty leading-relaxed">
              Here's a {state.itinerary.durationDays}-day plan for{" "}
              <span className="font-semibold">{state.itinerary.destination}</span>. Reorder or
              expand any stop, and tap the pin to open it in Google Maps.
            </p>
            <ItineraryView
              key={`${state.prompt}::${state.itinerary.days[0]?.id ?? "0"}`}
              itinerary={state.itinerary}
              meta={state.meta}
              onChange={(itinerary) =>
                onEdit({ prompt: state.prompt, itinerary, meta: state.meta, dateRange })
              }
              onReset={onReset}
            />
          </div>
        )}
      </AssistantMessage>
    </div>
  );
}

function isEmpty(days: { stops: unknown[] }[]): boolean {
  return days.reduce((total, day) => total + day.stops.length, 0) === 0;
}

function UserMessage({ prompt, dateRange }: { prompt: string; dateRange: DateRange | null }) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary/12 px-4 py-2.5 text-[15px] text-foreground">
        {prompt}
      </div>
      {dateRange && (
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <CalendarDays className="size-3" aria-hidden />
          {formatRangeLabel(dateRange)}
        </span>
      )}
    </div>
  );
}

function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-cat-shopping text-primary-foreground shadow-sm"
      >
        <Compass className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 pt-1">{children}</div>
    </div>
  );
}
