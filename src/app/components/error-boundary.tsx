import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Last-resort boundary for unexpected render errors, so a bug in one component
 * never leaves the user with a blank white screen. (Data/AI errors are handled
 * gracefully upstream and never reach here in normal operation.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[error-boundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="container flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Something broke</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Reloading usually fixes it.
          </p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
