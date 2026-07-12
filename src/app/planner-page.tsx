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
import { SidebarRail } from "./components/sidebar-rail";
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

  const heroHeight = isHome ? "34rem" : "13rem";

  return (
    <div className="flex min-h-[100dvh]">
      <SidebarRail onNewTrip={handleNewTrip} onHome={handleHome} active={isHome ? "home" : "plan"} />

      <main className="relative min-w-0 flex-1 overflow-x-hidden">
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
          <Hero compact={!isHome}>
            <SearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              onGenerate={controller.generate}
              isLoading={state.kind === "loading"}
              faultDemoEnabled={serverInfo.faultDemo}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              autoFocus={isHome}
            />
          </Hero>

          <div className="min-h-[40vh] bg-background">
            <div className="mx-auto max-w-5xl px-5 pb-24">
              <StatusAnnouncer state={state} />
              {isHome ? (
                <PopularDestinations onPick={handlePickDestination} />
              ) : (
                <PlanThread
                  state={state}
                  dateRange={dateRange}
                  onRetry={controller.retry}
                  onReset={handleNewTrip}
                  onEdit={save}
                />
              )}
            </div>
          </div>
        </div>
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
