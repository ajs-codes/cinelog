import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ReactionButtonProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export function ReactionButton({
  icon: Icon,
  iconClassName = "",
  label,
  active = false,
  disabled = false,
  className = "",
  onClick,
}: ReactionButtonProps) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
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
      <Icon className={`h-4 w-4 ${iconClassName}`} />
      {label}
    </Button>
  );
}

export default ReactionButton;
