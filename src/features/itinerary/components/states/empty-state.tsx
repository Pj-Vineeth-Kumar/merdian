import { Compass, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Shown when the model returns a valid but content-free plan (zero stops). This
 * is distinct from an error — the request worked, there's just nothing to show.
 */
export function EmptyResultState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl font-semibold tracking-tight">No stops came back</h3>
        <p className="max-w-md text-pretty text-sm text-muted-foreground">
          The model understood the request but didn't return any stops. Try adding a bit more detail,
          like the destination, how many days, and what you enjoy.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RotateCcw aria-hidden />
        Try again
      </Button>
    </div>
  );
}

/** The very first screen, before anything has been generated. */
export function IdleState() {
  return (
    <div className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Compass className="size-6" aria-hidden />
      </span>
      <h3 className="font-display text-xl font-semibold tracking-tight">Your plan appears here</h3>
      <p className="max-w-sm text-pretty text-sm text-muted-foreground">
        Describe a trip on the left and Meridian turns it into a day-by-day itinerary you can
        expand, reorder, and trim.
      </p>
    </div>
  );
}
