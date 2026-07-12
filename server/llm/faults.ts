import type { FaultMode } from "@shared/constants";

import { mockItineraryJson } from "../providers/mock";

import { LlmError } from "./errors";

/**
 * Deterministic fault injection for demoing failure handling. Each mode produces
 * exactly the kind of bad output the brief asks us to survive. Non-throwing modes
 * return raw "model text" that flows through the SAME parse/validate pipeline as
 * real output, so the demo exercises the real code path, not a special case.
 */
export async function simulateFaultText(
  fault: FaultMode,
  prompt: string,
  signal: AbortSignal,
): Promise<string> {
  switch (fault) {
    case "malformed-json":
      // Truncated JSON — survives fence-stripping but fails JSON.parse.
      return '{"destination":"Faultland","summary":"demo","days":[{"title":"Day 1","stops":[{"name":"Broken",';
    case "wrong-shape":
      // Parses as JSON, but `days` is the wrong type → fails schema validation.
      return JSON.stringify({ destination: "Faultland", summary: "demo", days: "not-an-array" });
    case "empty":
      // Valid and well-shaped, but zero stops → the app's "empty" state.
      return JSON.stringify({
        destination: "Faultland",
        summary: "The model returned a plan with no stops.",
        days: [],
      });
    case "slow":
      // Succeeds, but slowly — exercises the loading state and the stale-response
      // guard (fire this, then fire a fast request: the fast one must win).
      await delay(3_500, signal);
      return mockItineraryJson(prompt);
    case "http-500":
      throw new LlmError("upstream_error", "Injected upstream 500 (demo).", {
        retryable: true,
        httpStatus: 502,
      });
    case "rate-limit":
      throw new LlmError("rate_limited", "Injected rate limit (demo).", {
        retryable: true,
        httpStatus: 429,
      });
    default: {
      const exhaustive: never = fault;
      return exhaustive;
    }
  }
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
