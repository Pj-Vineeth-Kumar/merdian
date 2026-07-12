import { Compass, Map, PenLine } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./theme-toggle";

interface SidebarRailProps {
  onNewTrip: () => void;
  onHome: () => void;
  /** "home" before a plan exists, "plan" once one is shown. */
  active: "home" | "plan";
}

export function SidebarRail({ onNewTrip, onHome, active }: SidebarRailProps) {
  return (
    <nav
      aria-label="Primary"
      className="glass sticky top-0 z-30 flex h-[100dvh] w-16 shrink-0 flex-col items-center gap-2 border-r py-4"
    >
      <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Compass className="size-5" aria-hidden />
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center gap-1.5">
        <RailButton label="New trip" onClick={onNewTrip}>
          <PenLine className="size-[18px]" aria-hidden />
        </RailButton>
        <RailButton label="Home" onClick={onHome} active={active === "home"}>
          <Compass className="size-[18px]" aria-hidden />
        </RailButton>
        <RailButton label="Current plan" onClick={onHome} active={active === "plan"}>
          <Map className="size-[18px]" aria-hidden />
        </RailButton>
      </div>

      <ThemeToggle />
      <div
        className="mt-1 grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-cat-nightlife/70 text-xs font-semibold text-primary-foreground"
        aria-hidden
        title="Signed in as a traveler"
      >
        MK
      </div>
    </nav>
  );
}

function RailButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "bg-muted text-foreground",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
