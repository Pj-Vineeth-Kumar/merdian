import type { FaultMode } from "@shared/constants";
import { LLM_TIMEOUT_MS, RETRY } from "@shared/constants";
import type { DateRange, GenerateResponse } from "@shared/schemas/api";
import type { Itinerary, ModelItinerary } from "@shared/schemas/itinerary";
import { itinerarySchema, modelItinerarySchema } from "@shared/schemas/itinerary";

import { provider } from "../providers";

import { dayLabel, rangeDayCount } from "./dates";
import { LlmError, RETRYABLE_CODES } from "./errors";
import { simulateFaultText } from "./faults";
import { parseJsonLenient } from "./json-repair";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";

interface GenerateArgs {
  prompt: string;
  /** Aborted when the client disconnects. Linked to a per-attempt timeout. */
  signal: AbortSignal;
  fault?: FaultMode;
  /** When present, the plan spans exactly these dates and each day is dated. */
  dateRange?: DateRange | null;
}

/**
 * The full pipeline: (optional fault) → provider call with timeout + transient
 * retry → cheap JSON repair → JSON.parse → Zod validation → id assignment.
 * Every failure mode throws a typed LlmError; the route turns that into a clean
 * HTTP response. Nothing unvalidated ever leaves this function.
 */
export async function generateItinerary({
  prompt,
  signal,
  fault,
  dateRange,
}: GenerateArgs): Promise<GenerateResponse> {
  const startedAt = performance.now();

  let rawText: string;
  let attempts = 1;

  if (fault) {
    rawText = await simulateFaultText(fault, prompt, signal);
  } else {
    const result = await callProviderWithRetry(prompt, signal, dateRange);
    rawText = result.text;
    attempts = result.attempts;
  }

  const itinerary = parseAndValidate(rawText, dateRange);

  return {
    itinerary,
    meta: {
      provider: provider.name,
      model: provider.model,
      latencyMs: Math.round(performance.now() - startedAt),
      attempts,
    },
  };
}

/** Calls the provider, retrying ONLY transient transport failures with backoff. */
async function callProviderWithRetry(
  prompt: string,
  externalSignal: AbortSignal,
  dateRange: DateRange | null | undefined,
): Promise<{ text: string; attempts: number }> {
  const system = SYSTEM_PROMPT;
  const user = buildUserPrompt(prompt, promptContext(dateRange));
  let lastError: LlmError | undefined;

  for (let attempt = 1; attempt <= RETRY.maxAttempts; attempt++) {
    const { signal, cleanup } = linkTimeout(externalSignal, LLM_TIMEOUT_MS);
    try {
      const text = await provider.complete({ system, user, signal });
      return { text, attempts: attempt };
    } catch (error) {
      lastError = toLlmError(error);
      // The client is gone — stop immediately, don't burn retries.
      if (externalSignal.aborted) throw lastError;
      const canRetry = RETRYABLE_CODES.has(lastError.code) && attempt < RETRY.maxAttempts;
      if (!canRetry) throw lastError;
      await sleep(backoffDelay(attempt));
    } finally {
      cleanup();
    }
  }

  throw lastError ?? new LlmError("internal", "Unknown provider failure.");
}

/** Repair → parse → validate → assign ids. Turns bad output into typed errors. */
function parseAndValidate(rawText: string, dateRange: DateRange | null | undefined): Itinerary {
  let parsed: unknown;
  try {
    parsed = parseJsonLenient(rawText);
  } catch (cause) {
    throw new LlmError("invalid_json", "The model did not return valid JSON.", {
      retryable: true,
      httpStatus: 502,
      cause,
    });
  }

  const result = modelItinerarySchema.safeParse(parsed);
  if (!result.success) {
    // Log the issues server-side for debugging; never leak raw output to the client.
    console.warn("[llm] itinerary failed schema validation:", result.error.issues.slice(0, 5));
    throw new LlmError(
      "invalid_shape",
      "The model's response did not match the expected itinerary format.",
      // Retryable because generation is stochastic: a user-initiated Retry often
      // succeeds. We do NOT auto-retry it (that would be a deterministic loop) —
      // auto-retry is reserved for transient transport errors above.
      { retryable: true, httpStatus: 502 },
    );
  }

  return finalize(result.data, dateRange);
}

/** Assign stable ids, derive dayNumber, and (if a range was given) stamp dates. */
function finalize(data: ModelItinerary, dateRange: DateRange | null | undefined): Itinerary {
  const days = data.days.map((day, index) => ({
    id: crypto.randomUUID(),
    dayNumber: index + 1,
    title: day.title || `Day ${index + 1}`,
    // When the user picked dates, the day's date is authoritative and overrides
    // whatever the model produced, so the plan matches the calendar exactly.
    date: dateRange ? dayLabel(dateRange, index) : day.date,
    stops: day.stops.map((stop) => ({ id: crypto.randomUUID(), ...stop })),
  }));

  // Final guard against the contract schema — should always pass.
  return itinerarySchema.parse({
    destination: data.destination,
    summary: data.summary,
    durationDays: days.length,
    days,
  });
}

/** Build the prompt context (target day count + window label) from a date range. */
function promptContext(dateRange: DateRange | null | undefined): {
  days?: number;
  window?: string;
} {
  if (!dateRange) return {};
  const days = rangeDayCount(dateRange);
  return { days, window: `${dayLabel(dateRange, 0)} to ${dayLabel(dateRange, days - 1)}` };
}

// ── small helpers ────────────────────────────────────────────────────────────

function toLlmError(error: unknown): LlmError {
  if (error instanceof LlmError) return error;
  return new LlmError("upstream_error", "Unexpected provider failure.", {
    retryable: true,
    cause: error,
  });
}

/** Exponential backoff with full jitter, capped. */
function backoffDelay(attempt: number): number {
  const exp = Math.min(RETRY.baseDelayMs * 2 ** (attempt - 1), RETRY.maxDelayMs);
  return Math.round(Math.random() * exp);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A signal that aborts on timeout OR when the external (request) signal aborts. */
function linkTimeout(
  external: AbortSignal,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort(external.reason);

  if (external.aborted) {
    controller.abort(external.reason);
  } else {
    external.addEventListener("abort", onExternalAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      external.removeEventListener("abort", onExternalAbort);
    },
  };
}
