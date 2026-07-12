import { STOP_CATEGORIES } from "@shared/schemas/itinerary";

import { LlmError } from "../llm/errors";

import type { CompletionInput, LlmProvider } from "./types";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Gemini's structured-output schema (a subset of OpenAPI). Constraining the
 * model with this dramatically reduces malformed output — but we STILL validate
 * the response with Zod afterward (constrain + validate are complementary, not
 * redundant). Only genuinely structural fields are `required`; soft fields are
 * left optional and nullable so the model has an easy, valid path.
 */
const responseSchema = {
  type: "OBJECT",
  properties: {
    destination: { type: "STRING" },
    summary: { type: "STRING" },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          date: { type: "STRING", nullable: true },
          stops: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                category: { type: "STRING", enum: [...STOP_CATEGORIES] },
                timeOfDay: {
                  type: "STRING",
                  enum: ["morning", "afternoon", "evening", "night"],
                  nullable: true,
                },
                durationMinutes: { type: "INTEGER", nullable: true },
                description: { type: "STRING" },
                location: { type: "STRING", nullable: true },
                cost: { type: "STRING", enum: ["free", "$", "$$", "$$$"], nullable: true },
                tip: { type: "STRING", nullable: true },
              },
              required: ["name", "category", "description"],
            },
          },
        },
        required: ["title", "stops"],
      },
    },
  },
  required: ["destination", "summary", "days"],
} as const;

interface GeminiPart {
  text?: string;
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

export function createGeminiProvider(apiKey: string, model: string): LlmProvider {
  return {
    name: "gemini",
    model,
    async complete({ system, user, signal }: CompletionInput): Promise<string> {
      let response: Response;
      try {
        response = await fetch(`${API_BASE}/${model}:generateContent`, {
          method: "POST",
          signal,
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema,
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          }),
        });
      } catch (cause) {
        // fetch throws on network failure or when the signal aborts.
        if (signal.aborted) {
          throw new LlmError("timeout", "The model took too long to respond.", {
            retryable: true,
            httpStatus: 504,
            cause,
          });
        }
        throw new LlmError("upstream_error", "Could not reach the model provider.", {
          retryable: true,
          cause,
        });
      }

      if (!response.ok) {
        throw mapHttpError(response.status, await safeText(response));
      }

      const data = (await response.json()) as GeminiResponse;

      if (data.promptFeedback?.blockReason) {
        throw new LlmError(
          "upstream_error",
          `The model blocked this request (${data.promptFeedback.blockReason}).`,
          { retryable: false, httpStatus: 502 },
        );
      }

      const candidate = data.candidates?.[0];
      const finish = candidate?.finishReason;
      if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") {
        throw new LlmError("upstream_error", `The model stopped early (${finish}).`, {
          retryable: false,
        });
      }

      const text = (candidate?.content?.parts ?? [])
        .map((part) => part.text ?? "")
        .join("")
        .trim();

      if (!text) {
        // Empty completion is treated as unparseable output downstream.
        throw new LlmError("invalid_json", "The model returned an empty response.", {
          retryable: true,
        });
      }
      return text;
    },
  };
}

function mapHttpError(status: number, body: string): LlmError {
  const detail = body ? ` (${body.slice(0, 200)})` : "";
  if (status === 429) {
    return new LlmError("rate_limited", "The model provider is rate-limiting requests.", {
      retryable: true,
      httpStatus: 429,
    });
  }
  if (status >= 500) {
    return new LlmError("upstream_error", `The model provider had an error${detail}.`, {
      retryable: true,
      httpStatus: 502,
    });
  }
  if (status === 401 || status === 403) {
    return new LlmError("upstream_error", "The model API key was rejected.", {
      retryable: false,
      httpStatus: 502,
    });
  }
  return new LlmError("upstream_error", `The model provider rejected the request${detail}.`, {
    retryable: false,
    httpStatus: 502,
  });
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
