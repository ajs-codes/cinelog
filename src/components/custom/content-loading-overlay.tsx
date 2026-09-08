import { LoaderCircle } from "lucide-react";

export function ContentLoadingOverlay() {
  return (
    <div
      aria-label="Loading content"
      aria-live="polite"
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-xs"
      role="status"
    >
      <LoaderCircle className="size-10 animate-spin text-brand-tertiary-accent-alt" />
    </div>
  );
}
