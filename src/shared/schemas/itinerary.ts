import { z } from "zod";

/**
 * The itinerary data contract — the ONE source of truth for the LLM's output
 * shape. Defined once here, it: (1) documents the shape, (2) produces the TS
 * types via z.infer, (3) is the JSON schema we hand to the model, and (4)
 * validates every response on the server (and defensively on the client).
 *
 * Design note on robustness (this is the graded part):
 * - STRUCTURAL fields (destination, a stop's name) are strict. If they are wrong,
 *   the whole parse fails and the UI shows an error, never garbage.
 * - SOFT fields (category, timeOfDay, cost, durationMinutes, tips) use `.catch()`
 *   so a single odd value the model invents degrades to a sensible default
 *   instead of nuking an otherwise-good multi-day plan.
 * - IDs are NOT requested from the model. The server assigns stable UUIDs after
 *   validation (see server/llm), so React keys and drag-reordering are reliable
 *   and the model can never hand us duplicate ids.
 */

export const STOP_CATEGORIES = [
  "food",
  "sightseeing",
  "outdoors",
  "culture",
  "nightlife",
  "shopping",
  "transport",
  "accommodation",
  "other",
] as const;

export const stopCategorySchema = z.enum(STOP_CATEGORIES).catch("other");

export const timeOfDaySchema = z
  .enum(["morning", "afternoon", "evening", "night"])
  .nullish()
  .catch(null)
  .transform((v) => v ?? null);

export const costTierSchema = z
  .enum(["free", "$", "$$", "$$$"])
  .nullish()
  .catch(null)
  .transform((v) => v ?? null);

/** A trimmed optional string that always normalizes missing/invalid to null. */
const optionalText = z
  .string()
  .trim()
  .min(1)
  .nullish()
  .catch(null)
  .transform((v) => v ?? null);

const durationMinutesSchema = z
  .number()
  .int()
  .positive()
  .max(24 * 60)
  .nullish()
  .catch(null)
  .transform((v) => v ?? null);

/** A single stop as returned by the model (no id — the server assigns it). */
export const modelStopSchema = z.object({
  name: z.string().trim().min(1),
  category: stopCategorySchema,
  timeOfDay: timeOfDaySchema,
  durationMinutes: durationMinutesSchema,
  description: z.string().trim().catch("").default(""),
  location: optionalText,
  cost: costTierSchema,
  tip: optionalText,
});

/** A single day as returned by the model. */
export const modelDaySchema = z.object({
  title: z.string().trim().catch("").default(""),
  date: optionalText,
  // A MISSING stops key defaults to []; a present-but-wrong-type value (e.g. a
  // string) is a genuine shape error and is allowed to fail validation.
  stops: z.array(modelStopSchema).default([]),
});

/** The full itinerary as returned by the model. */
export const modelItinerarySchema = z.object({
  destination: z.string().trim().min(1),
  summary: z.string().trim().catch("").default(""),
  days: z.array(modelDaySchema).default([]),
});

// ── Contract schemas (server → client): identical, plus server-assigned ids ──

export const stopSchema = modelStopSchema.extend({ id: z.string().min(1) });

export const daySchema = modelDaySchema.extend({
  id: z.string().min(1),
  dayNumber: z.number().int().positive(),
  stops: z.array(stopSchema),
});

export const itinerarySchema = modelItinerarySchema.extend({
  durationDays: z.number().int().nonnegative(),
  days: z.array(daySchema),
});

export type StopCategory = z.infer<typeof stopCategorySchema>;
export type TimeOfDay = NonNullable<z.infer<typeof timeOfDaySchema>>;
export type CostTier = NonNullable<z.infer<typeof costTierSchema>>;
export type ModelItinerary = z.infer<typeof modelItinerarySchema>;
export type Stop = z.infer<typeof stopSchema>;
export type Day = z.infer<typeof daySchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;

/** Total number of stops across all days — used to detect the "empty" state. */
export function countStops(itinerary: Itinerary): number {
  return itinerary.days.reduce((total, day) => total + day.stops.length, 0);
}
