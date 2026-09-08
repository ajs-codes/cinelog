import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchGroupProps = Omit<React.ComponentProps<typeof Input>, "onChange"> & {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  showClearButton?: boolean;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
};

function SearchGroup({
  className,
  endIcon,
  onClear,
  onValueChange,
  showClearButton = true,
  startIcon,
  value,
  ...props
}: SearchGroupProps) {
  const hasValue = Boolean(value);
  const showEndIcon = showClearButton && hasValue && endIcon;

  return (
    <div
      className={cn(
        "relative flex h-12.5 w-full min-w-0 items-center rounded-xl border border-outline-alt bg-surface shadow-[0_0_0_2px_rgb(51_102_204/30%)] transition-colors",
        className,
      )}
    >
      {startIcon ? (
        <span className="pointer-events-none absolute left-4 flex size-5 items-center justify-center text-outline-muted">
          {startIcon}
        </span>
      ) : null}
      <Input
        {...props}
        aria-label={props["aria-label"] ?? "Search"}
        className={cn(
          "h-full border-0 bg-transparent font-public-sans text-base text-white shadow-none outline-none ring-0 placeholder:text-text-secondary focus-visible:border-0 focus-visible:ring-0",
          startIcon ? "pl-12" : "pl-3",
          endIcon ? "pr-12" : "pr-3",
        )}
        onChange={(event) => onValueChange?.(event.target.value)}
        value={value}
      />
      {showEndIcon ? (
        <Button
          aria-label="Clear search"
          className="absolute right-2 size-7 p-0 text-outline-muted"
          onClick={onClear}
          size="icon-sm"
          type="button"
          variant="darkTonal"
        >
          {endIcon}
        </Button>
      ) : null}
    </div>
  );
}

export { SearchGroup };
