/**
 * Cross-cutting constants. No magic numbers scattered across the codebase.
 * Imported by both the server and the client.
 */

/** How long the server waits for the upstream LLM before aborting (ms). */
export const LLM_TIMEOUT_MS = 30_000;

/** Transient-failure retry policy (server-side). Validation errors are NOT retried. */
export const RETRY = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 6_000,
} as const;

/** Free-form trip description bounds. */
export const TRIP_INPUT = {
  minChars: 3,
  maxChars: 2_000,
} as const;

/** Client input debounce (ms) for the live character counter / draft persistence. */
export const INPUT_DEBOUNCE_MS = 300;

/** How long an identical request stays "fresh" in the query cache (ms). */
export const ITINERARY_STALE_MS = 10 * 60_000;

/** Tailwind breakpoints, mirrored for JS media queries. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/** localStorage keys. */
export const STORAGE_KEYS = {
  theme: "meridian.theme",
  session: "meridian.session.v1",
} as const;

/**
 * Fault-injection modes for demoing failure handling. The client can request one
 * via the `x-fault` header; the server honors it only when FAULT_DEMO is enabled.
 */
export const FAULT_MODES = [
  "malformed-json",
  "wrong-shape",
  "empty",
  "slow",
  "http-500",
  "rate-limit",
] as const;
export type FaultMode = (typeof FAULT_MODES)[number];
