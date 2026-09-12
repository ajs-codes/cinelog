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
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary bg-brand-primary px-2.5 py-1.5 font-semibold uppercase tracking-[0.08em] text-brand-on-primary">
        <TvMinimal className="h-3.5 w-3.5 text-brand-on-primary" />
        <span className="font-bold">{contentType}</span>
      </span>
      <span className="text-on-surface-variant">{year}</span>
      <span className="text-on-surface-variant">•</span>
      <span className="text-on-surface-variant">{duration}</span>
      <span className="text-on-surface-variant">•</span>
      <span className="inline-flex items-center rounded-xl border border-outline-alt bg-surface-container-high px-2 py-1 text-[11px] font-semibold text-secondary">
        {rating}
      </span>
      <span className="ml-2 inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-semibold text-brand-tertiary-accent-alt border border-outline-alt">
        {status}
      </span>
    </div>
  );
}

export default MetaRow;
