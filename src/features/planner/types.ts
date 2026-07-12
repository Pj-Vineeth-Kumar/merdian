import type { FaultMode } from "@shared/constants";
import type { DateRange, GenerateMeta, Itinerary } from "@shared/types";

import type { ApiError } from "@/lib/api-client";

/** A saved session: enough to restore the view without re-calling the model. */
export interface TripSession {
  prompt: string;
  itinerary: Itinerary;
  meta: GenerateMeta;
  dateRange?: DateRange | null;
  savedAt: number;
}

/**
 * The async lifecycle of a generation, modeled as a discriminated union so the
 * UI must handle every case (idle / loading / error / ready). "Empty" is derived
 * from a ready itinerary with zero stops — no separate state needed.
 */
export type ItineraryState =
  | { kind: "idle" }
  | { kind: "loading"; prompt: string }
  | { kind: "error"; prompt: string; error: ApiError }
  | { kind: "ready"; prompt: string; itinerary: Itinerary; meta: GenerateMeta };

export interface GenerateOptions {
  fault?: FaultMode;
  dateRange?: DateRange | null;
}
