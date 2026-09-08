import { AlertCircle, RefreshCw } from "lucide-react";

type ContentErrorStateProps = {
  compact?: boolean;
  message: string;
  onRetry: () => void;
};

export function ContentErrorState({
  compact = false,
  message,
  onRetry,
}: ContentErrorStateProps) {
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
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-surface transition hover:bg-brand-primary/85"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      </div>
    </section>
  );
}
