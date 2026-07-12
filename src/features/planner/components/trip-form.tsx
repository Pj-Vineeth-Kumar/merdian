import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import type { KeyboardEvent } from "react";

import { TRIP_INPUT } from "@shared/constants";
import type { FaultMode } from "@shared/constants";
import { generateRequestSchema, type GenerateRequest } from "@shared/schemas/api";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { GenerateOptions } from "../types";

import { ExamplePrompts } from "./example-prompts";
import { FaultMenu } from "./fault-menu";

const DEMO_PROMPT = "3 days in Barcelona: Gaudi, tapas, and an afternoon at the beach";

interface TripFormProps {
  onGenerate: (prompt: string, options?: GenerateOptions) => void;
  isLoading: boolean;
  faultDemoEnabled: boolean;
}

export function TripForm({ onGenerate, isLoading, faultDemoEnabled }: TripFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<GenerateRequest>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: { prompt: "" },
    mode: "onSubmit",
  });

  const value = watch("prompt") ?? "";
  const count = value.length;
  const overLimit = count > TRIP_INPUT.maxChars;

  const submit = handleSubmit(({ prompt }) => onGenerate(prompt));

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  const pickExample = (prompt: string) => {
    setValue("prompt", prompt, { shouldValidate: false, shouldDirty: true });
    setFocus("prompt");
  };

  const triggerFault = (fault: FaultMode) => {
    const prompt = getValues("prompt").trim() || DEMO_PROMPT;
    onGenerate(prompt, { fault });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="trip-prompt" className="font-display text-sm font-medium text-foreground">
          Describe your trip
        </label>
        <Textarea
          id="trip-prompt"
          rows={4}
          placeholder="e.g. 4 relaxed days in Rome with my partner: history, long lunches, and no early mornings"
          maxLength={TRIP_INPUT.maxChars + 200}
          aria-invalid={errors.prompt ? true : undefined}
          aria-describedby="trip-prompt-help"
          onKeyDown={onKeyDown}
          {...register("prompt")}
        />
        <div
          id="trip-prompt-help"
          className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
        >
          <span role={errors.prompt ? "alert" : undefined} className={cn(errors.prompt && "text-destructive")}>
            {errors.prompt?.message ?? "Include where, how long, and what you're into. Press ⌘/Ctrl + Enter to plan."}
          </span>
          <span className={cn("tabular shrink-0 font-mono", overLimit && "text-destructive")}>
            {count}/{TRIP_INPUT.maxChars}
          </span>
        </div>
      </div>

      <ExamplePrompts onPick={pickExample} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {faultDemoEnabled ? <FaultMenu onTrigger={triggerFault} /> : <span />}
        <Button type="submit" size="lg" loading={isLoading} className="min-w-[9.5rem]">
          <Sparkles aria-hidden />
          {isLoading ? "Planning" : "Plan my trip"}
        </Button>
      </div>
    </form>
  );
}
