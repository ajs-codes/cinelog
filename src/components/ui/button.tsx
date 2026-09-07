import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primaryFilled:
          "bg-brand-primary-container text-white hover:bg-brand-primary-container/80",
        accentFilled: "bg-brand-primary text-black hover:bg-brand-primary/80",
        darkFilled:
          "bg-surface-container-low text-secondary hover:bg-surface-container-low/80 border border-outline-muted",
        darkTonal:
          "bg-surface-container-high text-brand-primary hover:bg-surface-container-high/80 border border-brand-primary",
        ghost:
          "bg-surface-container-high text-brand-primary hover:bg-surface-container-high/80",
        dark: 
          "bg-surface-container-low text-on-surface hover:bg-surface-container-low/80",
        link: 
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-9 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon:
          "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "primaryFilled",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "primaryFilled",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
