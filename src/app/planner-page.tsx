import { useCallback, useEffect, useState } from "react";

import { countStops } from "@shared/schemas/itinerary";
import type { DateRange } from "@shared/types";

import {
  Hero,
  PopularDestinations,
  SearchBar,
  useItinerary,
  useTripSession,
} from "@/features/planner";

import { PlanThread } from "./components/plan-thread";
import { TopBar } from "./components/top-bar";
import { useServerInfo } from "./use-server-info";

// A real landscape photo from Lorem Picsum (stable id URL). Placeholder imagery:
// swap for licensed brand photography in production.
const HERO_IMAGE = "https://picsum.photos/id/1018/1920/900";

export function PlannerPage() {
  const serverInfo = useServerInfo();
  const { session, save, clearSession } = useTripSession();
  const controller = useItinerary(session);
  const { state } = controller;

  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | null>(session?.dateRange ?? null);

  const isHome = state.kind === "idle";

  // Persist a freshly generated, non-empty result (edits persist via onEdit).
  useEffect(() => {
    if (state.kind === "ready" && countStops(state.itinerary) > 0) {
      save({ prompt: state.prompt, itinerary: state.itinerary, meta: state.meta, dateRange });
    }
    // dateRange intentionally excluded: we snapshot whatever was active at generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, save]);

  const handleNewTrip = useCallback(() => {
    controller.reset();
    clearSession();
    setSearchValue("");
    setDateRange(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [controller, clearSession]);

  const handleHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePickDestination = useCallback((prompt: string) => {
    setSearchValue(prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // The hero image + gradient stay identical in both modes (same height/position).
  const heroHeight = "34rem";

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <TopBar onHome={handleHome} onNewTrip={handleNewTrip} showNewTrip={!isHome} />

      <main className="relative">
        {/* Shared photographic background — identical for the home and plan views:
            a sticky hero image that fades into the solid page below. */}
        <div
          aria-hidden
          className="pointer-events-none sticky top-0 z-0 overflow-hidden"
          style={{ height: heroHeight }}
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundColor: "hsl(var(--muted))", backgroundImage: `url(${HERO_IMAGE})` }}
            role="img"
            aria-label="Scenic mountain landscape"
          />
          <div className="absolute inset-0 hero-scrim" />
        </div>

        <div className="relative z-10" style={{ marginTop: `-${heroHeight}` }}>
          {isHome ? (
            <>
              <Hero>
                {/* Submitting from home switches to the plan view, so the loading
                    state is shown by the bottom composer, not here. */}
                <SearchBar
                  value={searchValue}
                  onValueChange={setSearchValue}
                  onGenerate={controller.generate}
                  isLoading={false}
                  faultDemoEnabled={serverInfo.faultDemo}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  autoFocus
                />
              </Hero>
              <div className="min-h-[40vh] bg-background">
                <div className="mx-auto max-w-5xl px-5 pb-24">
                  <StatusAnnouncer state={state} />
                  <PopularDestinations onPick={handlePickDestination} />
                </div>
              </div>
            </>
          ) : state.kind === "loading" ? (
            /* Generating: a calm, home-like screen — the trip shown over the hero
               image, with the "Planning your trip" indicator down by the input. */
            <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pb-24 pt-24 text-center sm:pt-28">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                Your trip
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                {state.prompt}
              </h1>
              <StatusAnnouncer state={state} />
            </div>
          ) : (
            <>
              {/* Reveal the shared hero image at the top (no text); the plan renders
                  on the solid page below it, with the input moved to the bottom. */}
              <div className="h-[13rem] sm:h-[15rem]" />
              <div className="min-h-[70vh] bg-background">
                <div className="mx-auto max-w-3xl px-5 pb-44 pt-8">
                  <StatusAnnouncer state={state} />
                  <PlanThread
                    state={state}
                    dateRange={dateRange}
                    onRetry={controller.retry}
                    onReset={handleNewTrip}
                    onEdit={save}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Floating input + generating indicator (no bottom container bar). The
            wrapper is click-through; only the pills themselves are interactive. */}
        {!isHome && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 px-4 pb-5">
            {state.kind === "loading" && (
              <div className="glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground shadow-lift">
                <span className="flex gap-1" aria-hidden>
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:160ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:320ms]" />
                </span>
                Planning your trip
              </div>
            )}
            <div className="pointer-events-auto w-full max-w-2xl">
              <SearchBar
                value={searchValue}
                onValueChange={setSearchValue}
                onGenerate={controller.generate}
                isLoading={state.kind === "loading"}
                faultDemoEnabled={serverInfo.faultDemo}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                variant="composer"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/** Politely announces the outcome for screen-reader users (no focus move). */
function StatusAnnouncer({ state }: { state: ReturnType<typeof useItinerary>["state"] }) {
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
