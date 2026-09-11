import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { BadgeIndicator } from "@/lib/types";

type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  text?: ReactNode;
  inlineStart?: ReactNode;
  inlineEnd?: ReactNode;
  indicator?: BadgeIndicator;
  children?: ReactNode;
};

const indicatorClasses: Record<BadgeIndicator, string> = {
  success: "bg-status-success",
  info: "bg-status-info",
  error: "bg-status-error",
  accentAlt: "bg-brand-tertiary-accent-alt",
};

function Badge({
  children,
  className,
  indicator,
  inlineEnd,
  inlineStart,
  text,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-outline-alt bg-surface-container-low px-3 py-1 font-public-sans text-xs leading-4 font-medium whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {indicator ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-2 shrink-0 rounded-full",
            indicatorClasses[indicator],
          )}
        />
      ) : null}
      {inlineStart ? (
        <span className="flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-full">
          {inlineStart}
        </span>
      ) : null}
      <span className="min-w-0 truncate">{text ?? children}</span>
      {inlineEnd ? (
        <span className="flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-full">
          {inlineEnd}
        </span>
      ) : null}
    </span>
  );
}

export { Badge };
export type { BadgeIndicator, BadgeProps };
