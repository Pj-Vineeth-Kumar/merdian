import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A shimmering placeholder. Skeletons match the shape of the content they stand
 * in for (not a generic spinner) so the layout doesn't jump when data arrives.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}
