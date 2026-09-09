"use client";

import { ActionBar } from "@/components/content-detail/hero-header/action-bar";
import { GenrePills } from "@/components/content-detail/hero-header/genre-pills";
import { MetaRow } from "@/components/content-detail/hero-header/meta-row";
import { PosterPanel } from "@/components/content-detail/hero-header/poster-panel";
import type { MovieDetails, SeriesDetails } from "@/lib/types";
import { orFallback } from "@/lib/utils";
import { useAppSelector } from "@/store";

type HeroHeaderProps = {
  movie?: MovieDetails | null;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function HeroHeader({ movie, series, type }: HeroHeaderProps) {
  const mediaType = type ?? (movie ? "movie" : "series");
  const mediaId = movie?.id ?? series?.id;
  const entry = useAppSelector((state) =>
    mediaId === undefined
      ? undefined
      : state.contentDetails[mediaType][String(mediaId)],
  );
  const title = orFallback(movie?.title || series?.name);
  const overview = orFallback(movie?.overview || series?.overview);
  const language = movie?.original_language ?? series?.original_language;
  const genres = movie?.genres ?? series?.genres;
  const imdbId = movie?.imdb_id ?? series?.imdb_id;
  const posterPath = movie?.poster_path ?? series?.poster_path;
  const rating = movie?.vote_average ?? series?.vote_average;
  return (
    <section
      className="relative m-4 rounded-[16px] border border-white/10 bg-linear-to-b from-surface-container-low via-surface-container to-surface p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
      aria-label="Title header"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[16px] pointer-events-none">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-tertiary/10 blur-[32px]" />
        <div className="absolute bottom-22 left-[26%] right-[42%] h-80 rounded-full bg-status-info/10 blur-[32px]" />
      </div>

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-x-8">
        <PosterPanel posterPath={posterPath} rating={rating} title={title} />

        <div className="col-span-1 flex min-w-0 flex-col justify-between md:col-span-9">
          <div className="flex flex-col gap-3">
            <MetaRow movie={movie} series={series} type={type} />

            <div className="space-y-2">
              <h1 className="font-heading text-3xl leading-[0.96] text-white sm:text-4xl md:text-[48px]">
                {title}
              </h1>
              <p className="max-w-230 text-[16px] font-medium text-outline-muted">
                {overview}
              </p>
            </div>

            <GenrePills genres={genres} type={series?.type ?? type} />
          </div>

          <ActionBar
            id={mediaId}
            imdbId={imdbId}
            language={language ?? undefined}
            type={type}
            isPresentInWatchlist={
              movie?.is_present_in_watchlist ?? series?.is_present_in_watchlist
            }
            impression={movie?.impression ?? series?.impression}
            watchStatus={movie?.watch_status ?? series?.watch_status}
            mutationStatus={entry?.mutationStatus}
            content={movie ?? series ?? undefined}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroHeader;
