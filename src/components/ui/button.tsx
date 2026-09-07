import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primaryFilled"
  | "accentFilled"
  | "darkFilled"
  | "darkTonal"
  | "ghost"
  | "dark"
  | "link";

type ButtonSize = "default" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

const variantClasses: Record<ButtonVariant, string> = {
  primaryFilled:
    "bg-brand-primary-container text-white hover:bg-brand-primary-container/80",
  accentFilled: "bg-brand-primary text-black hover:bg-brand-primary/80",
  darkFilled:
    "border border-outline-muted bg-surface-container-low text-secondary hover:bg-surface-container-low/80",
  darkTonal:
    "border border-brand-primary bg-surface-container-high text-brand-primary hover:bg-surface-container-high/80",
  ghost:
    "bg-surface-container-high text-brand-primary hover:bg-surface-container-high/80",
  dark: "bg-surface-container-low text-on-surface hover:bg-surface-container-low/80",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-8 gap-1.5 px-2.5",
  icon: "size-8",
  "icon-xs": "size-6 rounded-md",
  "icon-sm": "size-7 rounded-lg",
  "icon-lg": "size-9",
};

function buttonVariants({
  className,
  size = "default",
  variant = "primaryFilled",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

function Button({
  className,
  variant = "primaryFilled",
  size = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return (
    <button
      data-slot="button"
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

export { Button };
