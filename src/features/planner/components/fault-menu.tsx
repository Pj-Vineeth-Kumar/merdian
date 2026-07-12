import { ChevronDown, FlaskConical } from "lucide-react";

import type { FaultMode } from "@shared/constants";

const FAULTS: { mode: FaultMode; label: string; hint: string }[] = [
  { mode: "malformed-json", label: "Malformed JSON", hint: "Unparseable output" },
  { mode: "wrong-shape", label: "Wrong shape", hint: "Fails schema validation" },
  { mode: "empty", label: "Empty result", hint: "Valid, but no stops" },
  { mode: "slow", label: "Slow response", hint: "~3.5s; try superseding it" },
  { mode: "http-500", label: "Server error", hint: "Upstream 500" },
  { mode: "rate-limit", label: "Rate limited", hint: "429 from provider" },
];

/**
 * A disclosure that lets you deliberately trigger each failure mode so the
 * error/empty/loading handling can be demonstrated live. Built on native
 * <details> so it is keyboard-operable with no extra JS. Only shown when the
 * server reports the fault demo is enabled.
 */
export function FaultMenu({ onTrigger }: { onTrigger: (fault: FaultMode) => void }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
        <FlaskConical aria-hidden className="size-3.5" />
        Demo a failure
        <ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lift">
        {FAULTS.map((fault) => (
          <button
            key={fault.mode}
            type="button"
            onClick={(event) => {
              onTrigger(fault.mode);
              // Close the disclosure after picking.
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <span className="text-sm text-foreground">{fault.label}</span>
            <span className="text-xs text-muted-foreground">{fault.hint}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
