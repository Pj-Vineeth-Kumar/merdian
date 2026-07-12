import { AlertTriangle, RotateCcw } from "lucide-react";

import type { ApiErrorCode } from "@shared/types";

import { Button } from "@/components/ui/button";
import type { ApiError } from "@/lib/api-client";

/** Human-friendly headlines per error code. The server message adds specifics. */
const HEADLINE: Record<ApiErrorCode, string> = {
  bad_request: "Let's adjust that request",
  no_provider: "No AI provider configured",
  timeout: "The model timed out",
  upstream_error: "The model provider had a problem",
  rate_limited: "Too many requests",
  invalid_json: "The model returned unreadable output",
  invalid_shape: "The itinerary came back malformed",
  internal: "Something went wrong",
};

interface ErrorStateProps {
  error: ApiError;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-lg border border-destructive/40 bg-destructive/5 px-6 py-12 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl font-semibold tracking-tight">{HEADLINE[error.code]}</h3>
        <p className="max-w-md text-pretty text-sm text-muted-foreground">{error.message}</p>
      </div>
      {error.retryable && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
