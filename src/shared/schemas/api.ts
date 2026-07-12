import { z } from "zod";

import { FAULT_MODES, TRIP_INPUT } from "../constants";

import { itinerarySchema } from "./itinerary";

/** Request body the client sends to POST /api/generate. */
export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(TRIP_INPUT.minChars, `Describe your trip in at least ${TRIP_INPUT.minChars} characters.`)
    .max(TRIP_INPUT.maxChars, `Keep it under ${TRIP_INPUT.maxChars} characters.`),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/** Metadata returned alongside a successful itinerary (for the UI + debugging). */
export const generateMetaSchema = z.object({
  provider: z.enum(["gemini", "mock"]),
  model: z.string(),
  latencyMs: z.number(),
  attempts: z.number().int().positive(),
});
export type GenerateMeta = z.infer<typeof generateMetaSchema>;

/** Successful response body from POST /api/generate. */
export const generateResponseSchema = z.object({
  itinerary: itinerarySchema,
  meta: generateMetaSchema,
});
export type GenerateResponse = z.infer<typeof generateResponseSchema>;

/**
 * Stable, typed error codes. The client maps these to friendly copy and decides
 * whether a Retry button makes sense. Kept in sync with the server error handler.
 */
export const API_ERROR_CODES = [
  "bad_request", // client sent an invalid prompt
  "no_provider", // no LLM configured (should not happen — mock is the fallback)
  "timeout", // upstream LLM did not respond in time
  "upstream_error", // provider returned a non-2xx / network failure
  "rate_limited", // provider throttled us
  "invalid_json", // model output was not parseable JSON, even after repair
  "invalid_shape", // JSON parsed but failed schema validation
  "internal", // anything else
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** Error response body (sent with a non-2xx status). */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.enum(API_ERROR_CODES),
    message: z.string(),
    /** Whether the client should offer a Retry (transient failures only). */
    retryable: z.boolean(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const faultHeaderSchema = z.enum(FAULT_MODES);
