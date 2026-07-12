import { RotateCcw } from "lucide-react";

import type { GenerateMeta, Itinerary } from "@shared/types";

import { Button } from "@/components/ui/button";

import { useEditableItinerary } from "../hooks/use-editable-itinerary";

import { DaySection } from "./day-section";
import { ItineraryHeader } from "./itinerary-header";

interface ItineraryViewProps {
  itinerary: Itinerary;
  meta: GenerateMeta;
  /** Called after every edit so the parent can persist the current state. */
  onChange: (itinerary: Itinerary) => void;
  /** Start over (clears the plan and returns to the idle state). */
  onReset: () => void;
}

/**
 * The interactive itinerary. Holds an editable copy of the generated plan
 * (reorder / remove stops, remove days). The parent resets it on a new
 * generation via a React `key`, so this component never needs to sync props.
 */
export function ItineraryView({ itinerary: initial, meta, onChange, onReset }: ItineraryViewProps) {
  const [itinerary, actions] = useEditableItinerary(initial, onChange);

  return (
    <div className="flex flex-col gap-8">
      <ItineraryHeader itinerary={itinerary} meta={meta} />

      {itinerary.days.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-12 text-center">
          <p className="max-w-md text-pretty text-sm text-muted-foreground">
            You've cleared every day. Start a new trip whenever you're ready.
          </p>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw aria-hidden />
            New trip
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-9">
          {itinerary.days.map((day, index) => (
            <DaySection
              key={day.id}
              day={day}
              index={index}
              onReorder={(activeId, overId) => actions.reorderStops(day.id, activeId, overId)}
              onRemoveStop={(stopId) => actions.removeStop(day.id, stopId)}
              onRemoveDay={() => actions.removeDay(day.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
