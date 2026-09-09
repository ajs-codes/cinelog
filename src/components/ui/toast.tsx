"use client";

import { Info, X } from "lucide-react";
import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  duration?: number;
};

export function Toast({ message, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timeout);
  }, [duration, onDismiss]);

  return (
    <div className="pointer-events-none fixed top-16 right-0 z-50 flex w-full max-w-md flex-col items-end gap-2 p-4 sm:w-auto">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-status-info/35 bg-surface-container px-4 py-3 pr-10 text-sm text-on-surface shadow-2xl shadow-black/30 transition-colors"
      >
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-status-info/15 text-status-info">
          <Info className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1 leading-5">{message}</span>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="absolute top-2 right-2 rounded-md p-1 text-neutral transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:ring-2 focus-visible:ring-status-info/60 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
