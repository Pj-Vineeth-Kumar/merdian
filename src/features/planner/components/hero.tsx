import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface HeroProps {
  compact?: boolean;
  children: ReactNode;
}

/**
 * The hero copy + search slot. It renders transparently OVER the sticky
 * photographic background painted by the page, so the scrim behind it keeps
 * everything legible. `compact` shrinks it once a plan is on screen.
 */
export function Hero({ compact = false, children }: HeroProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col items-center px-5 text-center",
        compact ? "pb-6 pt-8" : "pb-10 pt-14 sm:pt-20",
      )}
    >
      {!compact && (
        <>
          <span
            aria-hidden
            className="grid size-14 place-items-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-cat-nightlife text-lg font-semibold text-primary-foreground shadow-lift"
          >
            MK
          </span>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70">
            Welcome to Meridian
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-5xl">
            Plan the days. <br className="hidden sm:block" />
            Just say where.
          </h1>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-foreground/75">
            From a weekend escape to a two-week adventure, Meridian turns a sentence into a
            day-by-day itinerary you can reorder, expand, and trim.
          </p>
        </>
      )}
      <div className={cn("w-full", compact ? "max-w-3xl" : "mt-8 max-w-2xl")}>{children}</div>
    </div>
  );
}
