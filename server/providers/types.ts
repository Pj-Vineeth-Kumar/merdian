/** The one interface every LLM provider implements. */
export interface CompletionInput {
  system: string;
  user: string;
  /** Aborted on timeout or client disconnect — providers MUST forward it. */
  signal: AbortSignal;
}

export interface LlmProvider {
  readonly name: "gemini" | "mock";
  readonly model: string;
  /**
   * Returns the RAW text the model produced (expected to be JSON). Parsing,
   * repair, and validation happen in the orchestration layer, not here — a
   * provider's only job is "prompt in, text out, typed error on transport fail".
   */
  complete(input: CompletionInput): Promise<string>;
}
