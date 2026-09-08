import { TvMinimal } from "lucide-react";
import type { MovieDetails, SeriesDetails } from "@/lib/types";

type MetaRowProps = {
  movie?: MovieDetails | null;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function MetaRow({ movie, series, type }: MetaRowProps) {
  const firstAirYear = series?.first_air_date?.slice(0, 4) ?? "N/A";
  const lastAirYear = series?.last_air_date?.slice(0, 4) ?? "Present";
  const year = movie
    ? (movie.release_date?.slice(0, 4) ?? "N/A")
    : firstAirYear === lastAirYear
      ? lastAirYear
      : `${firstAirYear} - ${lastAirYear}`;
  const seasonCount = series?.number_of_seasons ?? 1;
  const episodeCount = series?.number_of_episodes ?? 10;
  const rating = series?.content_ratings?.rating ?? "N/A";
  const status = movie?.status ?? series?.status ?? "N/A";
  const duration = movie?.runtime ? `${movie.runtime} min` : null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface">
      <span className="inline-flex items-center gap-2 rounded-md border border-brand-primary-container/40 bg-brand-primary-container/10 px-2.5 py-1.5 font-semibold uppercase tracking-[0.08em] text-brand-primary-container">
        <TvMinimal className="h-3.5 w-3.5 text-brand-primary" />
        <span className="font-bold">
          {type === "series" ? "Series" : "Movie"}
        </span>
      </span>
      <span className="text-outline-muted">{year}</span>
      <span className="text-outline-muted">•</span>
      <span className="text-outline-muted">
        {movie
          ? (duration ?? "N/A")
          : `${seasonCount} ${seasonCount === 1 ? "Season" : "Seasons"} (${episodeCount} ${episodeCount === 1 ? "Episode" : "Episodes"})`}
      </span>
      <span className="text-outline-muted">•</span>
      <span className="inline-flex items-center rounded-md border border-white/10 bg-surface-container px-2 py-1 text-[11px] font-semibold text-secondary">
        {rating}
      </span>
      <span className="ml-2 inline-flex items-center rounded-full border border-brand-tertiary-accent bg-brand-tertiary-accent/10 px-2.5 py-1 text-[11px] font-medium text-brand-tertiary-accent-alt">
        {status}
      </span>
    </div>
  );
}

export default MetaRow;
