"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import { usePopover } from "@/hooks/use-popover";
import { ICON_POPOVER_MENU_CLASS, TRIGGER_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type IconPopoverOption<T> = {
  value: T;
  label: string;
  icon: LucideIcon;
  className?: string;
};

type IconPopoverProps<T> = {
  options: IconPopoverOption<T>[];
  value: T | null;
  disabled?: boolean;
  loading?: boolean;
  triggerAriaLabel: string;
  triggerClassName?: string;
  triggerIcon?: LucideIcon;
  allowDeselect?: boolean;
  onSelect: (value: T) => void;
};

export function IconPopover<T>({
  options,
  value,
  disabled = false,
  loading = false,
  triggerAriaLabel,
  triggerClassName,
  triggerIcon,
  allowDeselect = false,
  onSelect,
}: IconPopoverProps<T>) {
  const { isOpen, containerRef, toggle, close } = usePopover(disabled || loading);
  const current = options.find((option) => option.value === value);
  const CurrentIcon = current?.icon ?? triggerIcon ?? options[0]?.icon;

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          ICON_POPOVER_MENU_CLASS,
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-1 scale-95 opacity-0",
        )}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <button
              aria-label={option.label}
              aria-pressed={isActive}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors hover:bg-surface-container-high",
                option.className,
                isActive && "bg-surface-container-high",
              )}
              key={String(option.value)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                close();
                if (isActive && !allowDeselect) return;
                onSelect(option.value);
              }}
              tabIndex={isOpen ? 0 : -1}
              title={option.label}
              type="button"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <button
        aria-expanded={isOpen}
        aria-label={triggerAriaLabel}
        className={cn(TRIGGER_CLASS, triggerClassName)}
        disabled={disabled || loading}
        onClick={toggle}
        type="button"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
        ) : CurrentIcon ? (
          <CurrentIcon className="h-4 w-4" />
        ) : null}
      </button>
    </div>
  );
}

