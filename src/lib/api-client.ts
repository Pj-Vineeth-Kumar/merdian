import { apiErrorSchema, type ApiErrorCode } from "@shared/schemas/api";

/**
 * The single HTTP boundary. All network access goes through here so error
 * handling, aborting, and typing are consistent — no raw fetch scattered across
 * features (see CLAUDE.md A7).
 */

/** A typed client-side error mirroring the server's error contract. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly retryable: boolean;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, retryable: boolean, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.retryable = retryable;
    this.status = status;
  }
}

interface PostOptions {
  signal?: AbortSignal;
  /** Extra headers (e.g. the x-fault demo header). */
  headers?: Record<string, string>;
}

/** POST JSON and parse a JSON response, throwing a typed ApiError on failure. */
export async function postJson<T>(url: string, body: unknown, options: PostOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...options.headers },
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (cause) {
    // Network failure or an aborted request. Abort errors are re-thrown so
    // TanStack Query can treat them as cancellations, not real errors.
    if (options.signal?.aborted) throw cause;
    throw new ApiError("upstream_error", "Network request failed. Check your connection.", true, 0);
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw toApiError(payload, response.status);
  }

  return payload as T;
}

function toApiError(payload: unknown, status: number): ApiError {
  const parsed = apiErrorSchema.safeParse(payload);
  if (parsed.success) {
    const { code, message, retryable } = parsed.data.error;
    return new ApiError(code, message, retryable, status);
  }
  return new ApiError("internal", "The server returned an unexpected error.", status >= 500, status);
}
