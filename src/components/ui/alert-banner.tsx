import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertBannerProps = {
  variant: "success" | "error";
  message: string;
  className?: string;
};

export function AlertBanner({ variant, message, className }: AlertBannerProps) {
  const isSuccess = variant === "success";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-3 font-public-sans text-xs sm:text-sm",
        isSuccess
          ? "border border-status-success/30 bg-status-success/10 text-status-success"
          : "border border-status-error/30 bg-status-error/10 text-status-error",
        className,
      )}
    >
      {isSuccess ? <Check className="h-4 w-4 shrink-0" /> : null}
      <span>{message}</span>
    </div>
  );
}
