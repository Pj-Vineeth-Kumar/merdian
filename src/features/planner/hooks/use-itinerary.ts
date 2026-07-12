import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef } from "react";

import { RETRY } from "@shared/constants";
import type { GenerateResponse } from "@shared/schemas/api";

import { ApiError } from "@/lib/api-client";

import { fetchItinerary } from "../api/generate-itinerary";
import type { GenerateOptions, ItineraryState, TripSession } from "../types";

type Action =
  | { type: "loading"; prompt: string }
  | { type: "ready"; response: GenerateResponse; prompt: string }
  | { type: "error"; error: ApiError; prompt: string }
  | { type: "reset" };

function reducer(_state: ItineraryState, action: Action): ItineraryState {
  switch (action.type) {
    case "loading":
      return { kind: "loading", prompt: action.prompt };
    case "ready":
      return {
        kind: "ready",
        prompt: action.prompt,
        itinerary: action.response.itinerary,
        meta: action.response.meta,
      };
    case "error":
      return { kind: "error", prompt: action.prompt, error: action.error };
    case "reset":
      return { kind: "idle" };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

interface Variables {
  prompt: string;
  fault: GenerateOptions["fault"];
  dateRange: GenerateOptions["dateRange"];
  signal: AbortSignal;
}

export interface ItineraryController {
  state: ItineraryState;
  /** Kick off a generation. Supersedes any request already in flight. */
  generate: (prompt: string, options?: GenerateOptions) => void;
  /** Re-run the most recent prompt (e.g. from the error state's Retry button). */
  retry: () => void;
  /** Clear back to the idle state. */
  reset: () => void;
}

/**
 * Owns the generation lifecycle. THE headline requirement — "don't let a stale
 * response overwrite a newer one" — is enforced two ways, belt and suspenders:
 *
 *   1. Every new request aborts the previous one via AbortController (the fetch
 *      is actually cancelled, and the server aborts its upstream LLM call too).
 *   2. A monotonic request id: when a response resolves, we apply it ONLY if its
 *      id still matches the latest request. A slow earlier response that somehow
 *      resolves after a newer one is dropped.
 *
 * Transient transport errors are retried with backoff (via the mutation); model
 * output errors are surfaced immediately for a user-initiated Retry.
 */
export function useItinerary(initialSession: TripSession | null): ItineraryController {
  const [state, dispatch] = useReducer(
    reducer,
    initialSession,
    (session): ItineraryState =>
      session
        ? { kind: "ready", prompt: session.prompt, itinerary: session.itinerary, meta: session.meta }
        : { kind: "idle" },
  );

  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastArgs = useRef<{ prompt: string; options?: GenerateOptions } | null>(
    initialSession ? { prompt: initialSession.prompt } : null,
  );

  const mutation = useMutation<GenerateResponse, unknown, Variables>({
    mutationFn: ({ prompt, fault, dateRange, signal }) =>
      fetchItinerary(prompt, { signal, fault, dateRange }),
    retry: (failureCount, error) => {
      if (!(error instanceof ApiError)) return false;
      const transient = error.code === "upstream_error" || error.code === "rate_limited";
      return transient && failureCount < RETRY.maxAttempts - 1;
    },
    retryDelay: (attempt) =>
      Math.min(RETRY.baseDelayMs * 2 ** attempt, RETRY.maxDelayMs) * (0.5 + Math.random() * 0.5),
  });

  // Abort any in-flight request if the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const generate = useCallback(
    (prompt: string, options?: GenerateOptions) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;

      const id = ++requestId.current;
      lastArgs.current = { prompt: trimmed, options };

      // (1) Supersede the previous request: cancel its fetch entirely.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch({ type: "loading", prompt: trimmed });

      mutation.mutate(
        {
          prompt: trimmed,
          fault: options?.fault,
          dateRange: options?.dateRange ?? null,
          signal: controller.signal,
        },
        {
          onSuccess: (response) => {
            // (2) Drop the result unless this is still the latest request.
            if (id !== requestId.current) return;
            dispatch({ type: "ready", response, prompt: trimmed });
          },
          onError: (error) => {
            if (id !== requestId.current) return;
            if (controller.signal.aborted) return; // superseded — not a real error
            dispatch({
              type: "error",
              prompt: trimmed,
              error:
                error instanceof ApiError
                  ? error
                  : new ApiError("internal", "Something went wrong. Please try again.", true, 0),
            });
          },
        },
      );
    },
    [mutation],
  );

  const retry = useCallback(() => {
    const args = lastArgs.current;
    if (args) generate(args.prompt, args.options);
  }, [generate]);

  const reset = useCallback(() => {
    requestId.current += 1; // invalidate any in-flight response
    abortRef.current?.abort();
    lastArgs.current = null;
    dispatch({ type: "reset" });
  }, []);

  return { state, generate, retry, reset };
}
