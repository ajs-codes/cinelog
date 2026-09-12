"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  const isDark = mounted ? theme === "dark" : true;

  return (
    <Button
      type="button"
      size="icon"
      variant="dark"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative size-9 rounded-lg border border-outline-alt bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface transition-all duration-200",
        className,
      )}
    >
      <Sun
        className={cn(
          "size-4.5 transition-all duration-300 transform",
          isDark
            ? "rotate-0 scale-100 opacity-100 text-brand-tertiary-accent-alt"
            : "-rotate-90 scale-0 opacity-0 absolute",
        )}
        strokeWidth={1.8}
      />
      <Moon
        className={cn(
          "size-4.5 transition-all duration-300 transform",
          isDark
            ? "rotate-90 scale-0 opacity-0 absolute"
            : "rotate-0 scale-100 opacity-100 text-brand-primary",
        )}
        strokeWidth={1.8}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
