"use client";

import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchShortcutLabel } from "@/hooks/search-popup/use-search-shortcut";
import { cn } from "@/lib/utils";

export function FloatingSearchButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const shortcutLabel = useSearchShortcutLabel();

  return (
    <Button
      variant="primaryFilled"
      aria-label={
        shortcutLabel ? `Search movies (${shortcutLabel})` : "Search movies"
      }
      className={cn(
        "fixed right-4 bottom-20 sm:right-6 sm:bottom-20 lg:right-6 lg:bottom-6 z-30 size-12 sm:size-14 rounded-xl shadow-[0_4px_8px_rgb(0_0_0/30%)]",
        className,
      )}
      size="icon-lg"
      title={
        shortcutLabel ? `Search movies (${shortcutLabel})` : "Search movies"
      }
      type="button"
      {...props}
    >
      {shortcutLabel ? (
        <Badge
          aria-hidden="true"
          className="absolute -top-8 px-1.5 py-0.5 text-[10px] leading-3 text-secondary"
          text={shortcutLabel}
        />
      ) : null}
      <Search className="size-6" strokeWidth={2} />
    </Button>
  );
}
