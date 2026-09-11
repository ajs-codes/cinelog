import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-outline-alt bg-transparent px-2.5 py-1 text-base text-on-surface transition-colors outline-none placeholder:text-secondary focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-container-high/50 disabled:opacity-50 aria-invalid:border-status-error aria-invalid:ring-3 aria-invalid:ring-status-error/20 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
