import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  compact?: boolean;
  message: string;
  onRetry: () => void;
};

export function ErrorState({
  compact = false,
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      aria-labelledby="content-error-title"
      className={`flex items-center justify-center px-4 py-12 ${
        compact ? "min-h-64" : "min-h-[calc(100vh-3.5rem)]"
      }`}
    >
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <AlertCircle className="size-12 text-status-error" />
        <div className="space-y-2">
          <h1
            className="font-heading text-2xl text-on-surface"
            id="content-error-title"
          >
            Something went wrong
          </h1>
          <p className="text-sm text-outline-muted">{message}</p>
        </div>
        <Button
          className="h-10 gap-2 px-4 font-semibold"
          onClick={onRetry}
          type="button"
          variant="accentFilled"
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </section>
  );
}
