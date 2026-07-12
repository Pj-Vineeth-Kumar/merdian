import { CalendarRange, MapPin } from "lucide-react";

import { countStops } from "@shared/schemas/itinerary";
import type { GenerateMeta, Itinerary } from "@shared/types";

import { Badge } from "@/components/ui/badge";

interface ItineraryHeaderProps {
  itinerary: Itinerary;
  meta: GenerateMeta;
}

export function ItineraryHeader({ itinerary, meta }: ItineraryHeaderProps) {
  const stops = countStops(itinerary);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          Your itinerary
        </span>
        <h2 className="flex items-center gap-2.5 font-display text-3xl font-semibold leading-none tracking-tight text-balance sm:text-4xl">
          <MapPin className="size-6 shrink-0 text-primary sm:size-7" aria-hidden />
          {itinerary.destination}
        </h2>
        {itinerary.summary && (
          <p className="max-w-prose text-pretty leading-relaxed text-muted-foreground">
            {itinerary.summary}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary">
          <CalendarRange className="size-3.5" aria-hidden />
          {itinerary.durationDays} {itinerary.durationDays === 1 ? "day" : "days"}
        </Badge>
        <Badge variant="outline">
          {stops} {stops === 1 ? "stop" : "stops"}
        </Badge>
        <span className="tabular ml-auto font-mono text-[11px] text-muted-foreground">
          {meta.provider} / {meta.model} / {(meta.latencyMs / 1000).toFixed(1)}s
        </span>
      </div>
    </header>
  );
}
