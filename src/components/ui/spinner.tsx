import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** A small inline loading spinner. Decorative — announce loading via a live region. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden className={cn("size-4 animate-spin", className)} />;
}
