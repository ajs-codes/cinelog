import { Loader2, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReactionButtonProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const getReactionIconClasses = (label: string, active: boolean) => {
  if (active) {
    return "text-white fill-white dark:fill-transparent";
  }

  const normalized = label.trim().toLowerCase();
  if (normalized === "like") {
    return "text-status-info fill-status-info dark:fill-none";
  }
  if (normalized === "love") {
    return "text-status-error fill-status-error dark:fill-none";
  }
  if (normalized === "dislike") {
    return "text-neutral fill-neutral/80 dark:fill-none";
  }

  return "fill-current dark:fill-none";
};

export function ReactionButton({
  icon: Icon,
  iconClassName = "",
  label,
  active = false,
  loading = false,
  disabled = false,
  className = "",
  onClick,
}: ReactionButtonProps) {
  return (
    <Button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      variant={active ? "primaryFilled" : "darkFilled"}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
        active
          ? "border border-brand-primary-container bg-brand-primary-container text-white hover:bg-brand-primary-container/90"
          : "border border-transparent bg-surface-container text-on-surface hover:bg-surface-container-highest",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
      ) : (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            getReactionIconClasses(label, active),
            iconClassName,
          )}
        />
      )}
      {label}
    </Button>
  );
}

export default ReactionButton;
