"use client";

import { useState } from "react";
import { Heart, SmilePlus, ThumbsDown, ThumbsUp } from "lucide-react";

import { useClickOutside } from "@/hooks/use-click-outside";
import { IMPRESSION } from "@/lib/constants";
import { cn } from "@/lib/utils";

const IMPRESSION_CONFIG = {
  0: { icon: ThumbsDown, className: "text-outline-muted" },
  1: { icon: ThumbsUp, className: "text-status-info" },
  2: { icon: Heart, className: "text-status-error" },
} as const;

const TRIGGER_CLASS =
  "flex h-8 w-8 items-center justify-center rounded-[6px] bg-surface-container-high transition-colors hover:bg-surface-container disabled:pointer-events-none disabled:opacity-50";

type CardImpressionToggleProps = {
  impression: number | null;
  disabled?: boolean;
  onSelect: (impression: number | null) => void;
};

export function CardImpressionToggle({
  impression,
  disabled = false,
  onSelect,
}: CardImpressionToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(
    () => setIsOpen(false),
    isOpen,
  );

  if (disabled && isOpen) {
    setIsOpen(false);
  }

  const current =
    impression === null
      ? null
      : IMPRESSION_CONFIG[impression as keyof typeof IMPRESSION_CONFIG];
  const CurrentIcon = current?.icon ?? SmilePlus;

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          "absolute bottom-full right-0 mb-1.5 z-20 flex origin-bottom flex-col-reverse items-center gap-1 rounded-lg border border-outline-alt bg-surface-container p-1 shadow-[0_8px_24px_rgb(0_0_0/35%)] transition-all duration-200 ease-out",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0",
        )}
      >
        {Object.values(IMPRESSION).map((option) => {
          const config =
            IMPRESSION_CONFIG[option.value as keyof typeof IMPRESSION_CONFIG];
          const Icon = config.icon;
          const isActive = impression === option.value;

          return (
            <button
              aria-label={option.display_value}
              aria-pressed={isActive}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors hover:bg-surface-container-high",
                config.className,
                isActive && "bg-surface-container-high",
              )}
              key={option.value}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
                onSelect(isActive ? null : option.value);
              }}
              tabIndex={isOpen ? 0 : -1}
              title={option.display_value}
              type="button"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <button
        aria-expanded={isOpen}
        aria-label="Set impression"
        className={cn(
          TRIGGER_CLASS,
          current ? current.className : "text-outline-muted",
        )}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        type="button"
      >
        <CurrentIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
