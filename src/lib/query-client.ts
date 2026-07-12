import { QueryClient } from "@tanstack/react-query";

import { ITINERARY_STALE_MS, RETRY } from "@shared/constants";

import { ApiError } from "./api-client";

/**
 * One QueryClient for the app. The retry policy here is the CLIENT-side guard:
 * it retries ONLY transient failures the server flagged as `retryable`, and
 * never retries deterministic ones (bad_request, invalid_json, invalid_shape are
 * only retried when the user explicitly clicks Retry). The server does its own
 * transport-level backoff independently.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ITINERARY_STALE_MS,
      gcTime: ITINERARY_STALE_MS * 2,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (!(error instanceof ApiError)) return false;
        if (!error.retryable) return false;
        // Only auto-retry genuine transport hiccups; leave model-output errors to
        // the user-facing Retry button so we don't spin on a deterministic failure.
        const autoRetryable = error.code === "upstream_error" || error.code === "rate_limited";
        return autoRetryable && failureCount < RETRY.maxAttempts - 1;
      },
      retryDelay: (attempt) =>
        Math.min(RETRY.baseDelayMs * 2 ** attempt, RETRY.maxDelayMs) * (0.5 + Math.random() * 0.5),
    },
  },
});
