"use client";

import { useState } from "react";

import { useClickOutside } from "@/hooks/use-click-outside";
import {
  TRIGGER_CLASS,
  WATCH_STATUS,
  WATCH_STATUS_ICONS,
  WATCH_STATUS_INDICATOR,
  WATCH_STATUS_INDICATOR_TEXT,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type CardStatusToggleProps = {
  watchStatus: number;
  disabled?: boolean;
  onSelect: (watchStatus: number) => void;
};

export function CardStatusToggle({
  watchStatus,
  disabled = false,
  onSelect,
}: CardStatusToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(
    () => setIsOpen(false),
    isOpen,
  );

  if (disabled && isOpen) {
    setIsOpen(false);
  }

  const currentIndicator =
    WATCH_STATUS_INDICATOR[watchStatus] ?? WATCH_STATUS_INDICATOR[0];
  const CurrentIcon =
    WATCH_STATUS_ICONS[watchStatus as keyof typeof WATCH_STATUS_ICONS] ??
    WATCH_STATUS_ICONS[0];

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
        {Object.values(WATCH_STATUS).map((option) => {
          const Icon = WATCH_STATUS_ICONS[option.value];
          const indicator = WATCH_STATUS_INDICATOR[option.value];
          const isActive = option.value === watchStatus;

          return (
            <button
              aria-label={option.display_value}
              aria-pressed={isActive}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors hover:bg-surface-container-high",
                WATCH_STATUS_INDICATOR_TEXT[indicator],
                isActive && "bg-surface-container-high",
              )}
              key={option.value}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
                if (isActive) return;
                onSelect(option.value);
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
        aria-label="Set watch status"
        className={cn(
          TRIGGER_CLASS,
          WATCH_STATUS_INDICATOR_TEXT[currentIndicator],
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
