import { ArrowRight, CalendarDays, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { TRIP_INPUT } from "@shared/constants";
import type { DateRange } from "@shared/types";

import { Spinner } from "@/components/ui/spinner";
import { formatRangeLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";

import type { GenerateOptions } from "../types";

import { DateRangePicker } from "./date-range-picker";
import { ExamplePrompts } from "./example-prompts";
import { FaultMenu } from "./fault-menu";

interface SearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onGenerate: (prompt: string, options?: GenerateOptions) => void;
  isLoading: boolean;
  faultDemoEnabled: boolean;
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  autoFocus?: boolean;
  /** "hero" shows examples below and opens the date popover downward; "composer"
   *  is the compact sticky-bottom variant that opens the popover upward. */
  variant?: "hero" | "composer";
}

export function SearchBar({
  value,
  onValueChange,
  onGenerate,
  isLoading,
  faultDemoEnabled,
  dateRange,
  onDateRangeChange,
  autoFocus,
  variant = "hero",
}: SearchBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openUpward = variant === "composer";

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const valid = value.trim().length >= TRIP_INPUT.minChars;

  const submit = () => {
    if (!valid || isLoading) return;
    onGenerate(value, { dateRange });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative">
        <div className="glass flex items-center gap-2 rounded-full py-2 pl-3 pr-2 shadow-lift transition-shadow focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-cat-shopping text-primary-foreground"
          >
            <Sparkles className="size-4" />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={TRIP_INPUT.maxChars}
            aria-label="Describe your trip"
            placeholder="Try: a relaxed 4 days in Rome with great food"
            className="min-w-0 flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            aria-expanded={pickerOpen}
            className={cn(
              "hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex",
              dateRange ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3.5" aria-hidden />
            {dateRange ? formatRangeLabel(dateRange) : "Add dates"}
          </button>

          {dateRange && (
            <button
              type="button"
              onClick={() => onDateRangeChange(null)}
              aria-label="Clear dates"
              className="hidden size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid"
            >
              <X className="size-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!valid || isLoading}
            aria-label="Plan my trip"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:translate-y-px disabled:opacity-40"
          >
            {isLoading ? <Spinner className="text-primary-foreground" /> : <ArrowRight className="size-5" />}
          </button>
        </div>

        {pickerOpen && (
          <>
            <button
              type="button"
              aria-label="Close date picker"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setPickerOpen(false)}
            />
            <div
              className={cn(
                "absolute right-0 z-50",
                openUpward ? "bottom-full mb-2" : "top-full mt-2",
              )}
            >
              <DateRangePicker
                value={dateRange}
                onApply={(range) => {
                  onDateRangeChange(range);
                  setPickerOpen(false);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile date trigger (the inline one is hidden on small screens). */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground"
        >
          <CalendarDays className="size-3.5" aria-hidden />
          {dateRange ? formatRangeLabel(dateRange) : "Add dates"}
        </button>
      </div>

      {variant === "hero" && (
        <div className="flex flex-col items-center gap-3">
          <ExamplePrompts onPick={(prompt) => onValueChange(prompt)} />
          {faultDemoEnabled && (
            <FaultMenu
              onTrigger={(fault) => onGenerate(value.trim() || FALLBACK_PROMPT, { fault, dateRange })}
            />
          )}
        </div>
      )}
    </div>
  );
}

const FALLBACK_PROMPT = "3 days in Barcelona: Gaudi, tapas, and the beach";
