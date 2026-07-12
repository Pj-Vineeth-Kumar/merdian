import type { ApiErrorCode } from "@shared/schemas/api";

/**
 * A typed error carrying everything the HTTP layer needs to build a clean
 * response: a stable code, whether the client should offer Retry, and the HTTP
 * status to send. Every failure path in the LLM pipeline throws one of these,
 * so a raw exception never reaches the client.
 */
export class LlmError extends Error {
  readonly code: ApiErrorCode;
  readonly retryable: boolean;
  readonly httpStatus: number;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { retryable?: boolean; httpStatus?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "LlmError";
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.httpStatus = options.httpStatus ?? 502;
  }
}

/** Errors that are worth retrying with backoff (transient transport failures). */
export const RETRYABLE_CODES: ReadonlySet<ApiErrorCode> = new Set([
  "timeout",
  "upstream_error",
  "rate_limited",
]);
