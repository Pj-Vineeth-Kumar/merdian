import type { ReactNode } from "react";

interface HeroProps {
  children: ReactNode;
}

/**
 * The home hero copy + search slot. It renders transparently OVER the sticky
 * photographic background painted by the page, so the scrim behind it keeps
 * everything legible.
 */
export function Hero({ children }: HeroProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-10 pt-14 text-center sm:pt-20">
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
        From a weekend escape to a two-week adventure, Meridian turns a sentence into a day-by-day
        itinerary you can reorder, expand, and trim.
      </p>
      <div className="mt-8 w-full max-w-2xl">{children}</div>
    </div>
  );
}
