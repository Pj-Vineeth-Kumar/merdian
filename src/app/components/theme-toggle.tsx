import { Moon, Sun } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";

import { useTheme } from "../theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton
      label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      variant="outline"
      onClick={toggleTheme}
      className="border-border/70"
    >
      {isDark ? <Sun /> : <Moon />}
    </IconButton>
  );
}
