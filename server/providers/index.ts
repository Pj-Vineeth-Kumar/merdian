import { env } from "../env";
import { LlmError } from "../llm/errors";

import { createGeminiProvider } from "./gemini";
import { createMockProvider } from "./mock";
import type { LlmProvider } from "./types";

/** Instantiate the configured provider once at module load. */
function createProvider(): LlmProvider {
  if (env.providerName === "gemini") {
    if (!env.gemini.apiKey) {
      throw new LlmError("no_provider", "GEMINI_API_KEY is missing.", { httpStatus: 500 });
    }
    return createGeminiProvider(env.gemini.apiKey, env.gemini.model);
  }
  return createMockProvider();
}

export const provider: LlmProvider = createProvider();
export type { LlmProvider } from "./types";
