import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ProgressProps = ComponentProps<"div"> & {
  value?: number;
  max?: number;
};

function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max(((value ?? 0) / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-surface-container-high",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-brand-primary transition-all duration-200"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };
