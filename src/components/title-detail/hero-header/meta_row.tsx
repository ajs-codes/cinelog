import { TvMinimal } from "lucide-react";

type MetaRowProps = {
  type?: "movie" | "series";
};

export function MetaRow({ type }: MetaRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface">
      <span className="inline-flex items-center gap-2 rounded-md border border-brand-primary-container/40 bg-brand-primary-container/10 px-2.5 py-1.5 font-semibold uppercase tracking-[0.08em] text-brand-primary-container">
        <TvMinimal className="h-3.5 w-3.5 text-brand-primary" />
        <span className="font-bold">
          {type === "series" ? "Series" : "Movie"}
        </span>
      </span>
      <span className="text-outline-muted">2022</span>
      <span className="text-outline-muted">•</span>
      <span className="text-outline-muted">1 Season (10 Episodes)</span>
      <span className="text-outline-muted">•</span>
      <span className="inline-flex items-center rounded-md border border-white/10 bg-surface-container px-2 py-1 text-[11px] font-semibold text-secondary">
        TV-MA
      </span>
      <span className="ml-2 inline-flex items-center rounded-full border border-brand-tertiary-accent bg-brand-tertiary-accent/10 px-2.5 py-1 text-[11px] font-medium text-brand-tertiary-accent-alt">
        Studio Trigger × CD Projekt Red
      </span>
    </div>
  );
}

export default MetaRow;
