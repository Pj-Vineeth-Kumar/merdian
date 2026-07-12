import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/query-client";

import { ErrorBoundary } from "./components/error-boundary";
import { ThemeProvider } from "./theme-provider";

/** Composition root for all app-wide providers. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {/* Honor the OS "reduce motion" setting across all Motion animations. */}
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </MotionConfig>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
