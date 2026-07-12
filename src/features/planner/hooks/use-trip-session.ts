import { useCallback } from "react";
import { z } from "zod";

import { STORAGE_KEYS } from "@shared/constants";
import { generateMetaSchema } from "@shared/schemas/api";
import { itinerarySchema } from "@shared/schemas/itinerary";

import { useLocalStorage } from "@/hooks/use-local-storage";

import type { TripSession } from "../types";

const sessionSchema = z.object({
  prompt: z.string(),
  itinerary: itinerarySchema,
  meta: generateMetaSchema,
  savedAt: z.number(),
});

/** Validate stored data on read — corrupt or outdated storage becomes `null`. */
function parseSession(raw: unknown): TripSession | null {
  const parsed = sessionSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/**
 * Persists the current trip (prompt + itinerary + edits) to localStorage so a
 * reload restores it without another model call. Reads are schema-validated, so
 * a corrupt entry can never crash the app — it just falls back to empty.
 */
export function useTripSession() {
  const [session, setSession, clearSession] = useLocalStorage<TripSession | null>(
    STORAGE_KEYS.session,
    null,
    parseSession,
  );

  const save = useCallback(
    (next: Omit<TripSession, "savedAt">) => setSession({ ...next, savedAt: Date.now() }),
    [setSession],
  );

  return { session, save, clearSession };
}
