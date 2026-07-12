import { Compass } from "lucide-react";

import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Compass className="size-[18px]" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Meridian</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Trip planner
          </span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
