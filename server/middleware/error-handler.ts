import type { NextFunction, Request, Response } from "express";

import type { ApiError } from "@shared/schemas/api";

import { LlmError } from "../llm/errors";

/**
 * The single place that turns any thrown error into a clean, typed JSON body.
 * The client never sees a stack trace or a raw provider message — just a stable
 * code, friendly text, and whether Retry makes sense.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  // Express requires the 4-arg signature to recognize this as an error handler.
  _next: NextFunction,
): void {
  if (res.headersSent) return;

  const { status, body } = normalize(error);
  res.status(status).json(body);
}

function normalize(error: unknown): { status: number; body: ApiError } {
  if (error instanceof LlmError) {
    return {
      status: error.httpStatus,
      body: {
        error: { code: error.code, message: error.message, retryable: error.retryable },
      },
    };
  }

  console.error("[server] unexpected error:", error);
  return {
    status: 500,
    body: {
      error: {
        code: "internal",
        message: "Something went wrong on the server.",
        retryable: true,
      },
    },
  };
}
