import { useEffect } from "react";

import { countStops } from "@shared/schemas/itinerary";

import { Card } from "@/components/ui/card";
import {
  EmptyResultState,
  ErrorState,
  IdleState,
  ItinerarySkeleton,
  ItineraryView,
} from "@/features/itinerary";
import {
  TripForm,
  useItinerary,
  useTripSession,
  type ItineraryState,
  type TripSession,
} from "@/features/planner";

import { useServerInfo } from "./use-server-info";

export function PlannerPage() {
  const serverInfo = useServerInfo();
  const { session, save, clearSession } = useTripSession();
  const controller = useItinerary(session);
  const { state } = controller;

  // Persist a freshly generated, non-empty result. Edits are persisted by the
  // view's onChange, and this effect does NOT re-run on edits (they don't change
  // `state`), so it can never clobber an edited plan with the original.
  useEffect(() => {
    if (state.kind === "ready" && countStops(state.itinerary) > 0) {
      save({ prompt: state.prompt, itinerary: state.itinerary, meta: state.meta });
    }
  }, [state, save]);

  const handleReset = () => {
    controller.reset();
    clearSession();
  };

  return (
    <main className="container py-8 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-14">
        <section className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-[2.6rem]">
              Turn a sentence into a plan you can shape.
            </h1>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Describe a trip in your own words. Meridian asks an AI model for a structured
              itinerary, then hands you interactive days and stops to reorder, expand, and trim.
            </p>
          </div>

          <Card className="p-5">
            <TripForm
              onGenerate={controller.generate}
              isLoading={state.kind === "loading"}
              faultDemoEnabled={serverInfo.faultDemo}
            />
          </Card>

          <p className="font-mono text-[11px] text-muted-foreground">
            Engine: {serverInfo.provider === "gemini" ? "Google Gemini" : "built-in mock"}. Your
            plan is saved locally and restored on reload.
          </p>
        </section>

        <section className="min-w-0">
          <StatusAnnouncer state={state} />
          <Result state={state} onRetry={controller.retry} onReset={handleReset} onEdit={save} />
        </section>
      </div>
    </main>
  );
}

interface ResultProps {
  state: ItineraryState;
  onRetry: () => void;
  onReset: () => void;
  onEdit: (session: Omit<TripSession, "savedAt">) => void;
}

function Result({ state, onRetry, onReset, onEdit }: ResultProps) {
  switch (state.kind) {
    case "idle":
      return <IdleState />;
    case "loading":
      return <ItinerarySkeleton />;
    case "error":
      return <ErrorState error={state.error} onRetry={onRetry} />;
    case "ready":
      if (countStops(state.itinerary) === 0) return <EmptyResultState onRetry={onRetry} />;
      return (
        <ItineraryView
          key={`${state.prompt}::${state.itinerary.days[0]?.id ?? "0"}`}
          itinerary={state.itinerary}
          meta={state.meta}
          onChange={(itinerary) => onEdit({ prompt: state.prompt, itinerary, meta: state.meta })}
          onReset={onReset}
        />
      );
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

/** Politely announces the outcome for screen-reader users (no focus move happens). */
function StatusAnnouncer({ state }: { state: ItineraryState }) {
  let message = "";
  if (state.kind === "loading") message = "Generating your itinerary.";
  else if (state.kind === "error") message = `Error: ${state.error.message}`;
  else if (state.kind === "ready") {
    const stops = countStops(state.itinerary);
    message =
      stops === 0
        ? "The plan came back empty."
        : `Itinerary ready: ${stops} stops across ${state.itinerary.durationDays} days.`;
  }
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {message}
    </p>
  );
}
