import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ReactionButtonProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  className?: string;
};

export function ReactionButton({
  icon: Icon,
  label,
  active = false,
  className = "",
}: ReactionButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "primaryFilled" : "darkFilled"}
      className={[
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
        active
          ? "border border-brand-primary-container/40 bg-brand-primary-container/20 text-white hover:bg-brand-primary-container/30"
          : "text-on-surface hover:bg-white/5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        className={`h-4 w-4 ${
          active ? "fill-current text-brand-primary-container" : ""
        }`}
      />
      {label}
    </Button>
  );
}

export default ReactionButton;
