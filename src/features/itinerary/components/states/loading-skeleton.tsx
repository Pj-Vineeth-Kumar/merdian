import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder shaped like the real itinerary (header + two days of
 * stops), so the layout doesn't shift when data arrives. Announced politely.
 */
export function ItinerarySkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Generating your itinerary…</span>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-4/5 max-w-prose" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {[0, 1].map((day) => (
        <div key={day} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          {[0, 1, 2].map((stop) => (
            <Skeleton key={stop} className="h-[4.25rem] w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
