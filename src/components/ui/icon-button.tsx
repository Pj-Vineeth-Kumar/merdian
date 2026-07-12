import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "./button";

/** An icon-only button. `label` is REQUIRED — it becomes the accessible name. */
export interface IconButtonProps extends Omit<ButtonProps, "size" | "children"> {
  label: string;
  children: ButtonProps["children"];
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, variant = "ghost", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        variant={variant}
        aria-label={label}
        title={label}
        className={cn("rounded-full", className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";
