import { Compass, Plus } from "lucide-react";

import { ThemeToggle } from "./theme-toggle";

interface TopBarProps {
  onHome: () => void;
  onNewTrip: () => void;
  /** Show the "New trip" action once a plan exists. */
  showNewTrip: boolean;
}

/**
 * A transparent bar floating over the hero. It's `pointer-events-none` so it
 * never blocks the content beneath; only the controls themselves are clickable.
 */
export function TopBar({ onHome, onNewTrip, showNewTrip }: TopBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={onHome}
        aria-label="Meridian home"
        className="pointer-events-auto flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Compass className="size-[18px]" aria-hidden />
        </span>
        <span className="font-display text-base font-semibold tracking-tight">Meridian</span>
      </button>

      <div className="pointer-events-auto flex items-center gap-2">
        {showNewTrip && (
          <button
            type="button"
            onClick={onNewTrip}
            className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Plus className="size-4" aria-hidden />
            New trip
          </button>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
