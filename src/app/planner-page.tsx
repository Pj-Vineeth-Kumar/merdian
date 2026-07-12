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
        {/* Sticky photographic background. pointer-events-none so it never
            intercepts clicks; the content below is pulled up over it and its
            opaque sections cover it as the page scrolls. */}
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
                {/* Submitting from home immediately switches to the plan view, so
                    the loading state is shown by the bottom composer, not here. */}
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
          ) : (
            <>
              {/* Slim greeting over the hero image (search bar is now the bottom
                  composer). */}
              <div className="flex h-[15rem] flex-col items-center justify-end px-5 pb-8 text-center sm:h-[17rem]">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                  Welcome to Meridian
                </p>
              </div>
              {/* Scrollable generated content on a solid surface that covers the
                  rest of the sticky hero image. pb clears the fixed composer. */}
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

        {/* The chat composer, pinned to the bottom of the viewport. */}
        {!isHome && (
          <div className="fixed inset-x-0 bottom-0 z-30 glass border-t border-border">
            <div className="mx-auto max-w-3xl px-5 py-3">
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
