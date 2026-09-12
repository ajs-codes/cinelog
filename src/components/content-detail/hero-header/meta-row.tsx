import { TvMinimal } from "lucide-react";
import { useMetaRow } from "@/hooks/title-details/use-meta-row";
import type { MovieDetails, SeriesDetails } from "@/lib/types";

type MetaRowProps = {
  movie?: MovieDetails | null;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function MetaRow({ movie, series, type }: MetaRowProps) {
  const { contentType, duration, rating, status, year } = useMetaRow({
    movie,
    series,
    type,
  });

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface">
      <span className="inline-flex items-center gap-2 rounded-md border border-brand-primary-container/40 bg-brand-primary-container/10 px-2.5 py-1.5 font-semibold uppercase tracking-[0.08em] text-brand-primary-container">
        <TvMinimal className="h-3.5 w-3.5 text-brand-primary" />
        <span className="font-bold">{contentType}</span>
      </span>
      <span className="text-secondary">{year}</span>
      <span className="text-secondary">•</span>
      <span className="text-secondary">{duration}</span>
      <span className="text-secondary">•</span>
      <span className="inline-flex items-center rounded-md border border-outline-variant bg-surface-container px-2 py-1 text-[11px] font-semibold text-secondary">
        {rating}
      </span>
      <span className="ml-2 inline-flex items-center rounded-full border border-brand-tertiary-accent bg-brand-tertiary-accent/10 px-2.5 py-1 text-[11px] font-medium text-brand-tertiary-accent-alt">
        {status}
      </span>
    </div>
  );
}

export default MetaRow;
