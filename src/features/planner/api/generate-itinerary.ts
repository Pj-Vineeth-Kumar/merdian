import type { FaultMode } from "@shared/constants";
import { generateResponseSchema, type GenerateResponse } from "@shared/schemas/api";

import { ApiError, postJson } from "@/lib/api-client";

interface FetchOptions {
  signal: AbortSignal;
  fault?: FaultMode;
}

/**
 * Calls the backend to generate an itinerary. The server is the primary
 * validation gate, but we STILL defensively re-validate the payload here — a
 * proxy, a cache, or a version skew could hand us something malformed, and the
 * client should degrade to a clean error rather than render garbage.
 */
export async function fetchItinerary(
  prompt: string,
  { signal, fault }: FetchOptions,
): Promise<GenerateResponse> {
  const raw = await postJson<unknown>(
    "/api/generate",
    { prompt },
    { signal, headers: fault ? { "x-fault": fault } : undefined },
  );

  const parsed = generateResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      "invalid_shape",
      "The itinerary came back in an unexpected format. Please try again.",
      true,
      200,
    );
  }
  return parsed.data;
}
