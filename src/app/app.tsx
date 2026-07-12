import { TopBar } from "./components/top-bar";
import { PlannerPage } from "./planner-page";

export function App() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <TopBar />
      <div className="flex-1">
        <PlannerPage />
      </div>
      <footer className="border-t border-border/60">
        <div className="container flex flex-col gap-1 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Meridian. Structured AI trip planning.</span>
          <span className="font-mono">
            Built with React, TanStack Query, Zod, and a key-safe backend.
          </span>
        </div>
      </footer>
    </div>
  );
}
