"use client";

import Image from "next/image";
import Link from "next/link";

import { CardImpressionToggle } from "@/components/custom/card-impression-toggle";
import { CardStatusToggle } from "@/components/custom/card-status-toggle";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getYearString, posterUrl } from "@/lib/media/display";
import { canUpdateMovieWatchActivity } from "@/lib/media/status";
import type { LibraryMovie } from "@/lib/types";
import { formatCountry, formatLanguage } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  libraryItemKey,
  libraryItemMutationRequested,
} from "@/store/slices/librarySlice";

const FALLBACK_POSTER = "/file.svg";

function movieMeta(movie: LibraryMovie) {
  const language = movie.original_language?.trim();
  const country = movie.origin_country?.trim();
  const parts = [
    language ? formatLanguage(language) : null,
    country ? formatCountry(country) : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

export function MovieCard({ movie }: { movie: LibraryMovie }) {
  const dispatch = useAppDispatch();
  const isPending = useAppSelector(
    (state) =>
      state.library.pending[libraryItemKey("movie", movie.tmdb_id)] !==
      undefined,
  );

  const releaseYear = getYearString(movie.release_date ?? undefined);
  const rating = (movie.vote_average ?? 0).toFixed(1);
  const canUpdateWatchActivity = canUpdateMovieWatchActivity(movie.status);
  const meta = movieMeta(movie);

  const requestMutation = (
    payload: { watch_status: number } | { impression: number | null },
  ) => {
    dispatch(
      libraryItemMutationRequested({
        mediaType: "movie",
        tmdbId: movie.tmdb_id,
        ...payload,
      }),
    );
  };

  return (
    <Card className="group/card h-[352.5px] w-60 min-w-60 gap-0 overflow-hidden rounded-[8px] border-0 bg-surface-container-low p-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5">
      <CardContent className="p-0">
        <Link
          aria-label={`View ${movie.title} details`}
          className="relative block h-64 overflow-hidden bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary"
          href={`/movie/${movie.tmdb_id}`}
        >
          <Image
            alt={`${movie.title} poster`}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            loading="eager"
            src={posterUrl(movie.poster_path, FALLBACK_POSTER)}
            sizes="(max-width: 240px) 100vw, 240px"
          />

          <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-surface-container-low/20 to-transparent" />

          <div className="absolute left-3 top-3 flex h-4.5 items-center justify-center rounded-xs bg-surface-container-low/80 px-2 py-0.5 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-3.75 text-brand-primary">
              {releaseYear}
            </span>
          </div>

          <div className="absolute right-3 top-3 flex h-4.5 max-h-4.75 items-center justify-center rounded-xs bg-surface-container px-1.5 py-0.75 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-3.75 text-brand-tertiary">
              ★ {rating}
            </span>
          </div>
        </Link>
      </CardContent>

      <CardFooter className="h-[96.5px] flex-row items-end justify-between gap-2 rounded-none border-0 bg-surface-container-low px-3.5 py-3 text-on-surface">
        <Link
          className="flex min-w-0 flex-1 flex-col justify-end self-stretch rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          href={`/movie/${movie.tmdb_id}`}
          tabIndex={-1}
        >
          <h3 className="line-clamp-2 font-noto-sans text-[18px] font-semibold leading-6 text-on-surface">
            {movie.title}
          </h3>
          {meta ? (
            <p className="mt-0.5 truncate font-public-sans text-[11px] leading-4 text-secondary">
              {meta}
            </p>
          ) : null}
        </Link>

        <div className="flex shrink-0 items-end gap-1.5">
          <CardImpressionToggle
            disabled={isPending || !canUpdateWatchActivity}
            impression={movie.impression}
            onSelect={(impression) => requestMutation({ impression })}
          />
          <CardStatusToggle
            disabled={isPending || !canUpdateWatchActivity}
            onSelect={(watchStatus) =>
              requestMutation({ watch_status: watchStatus })
            }
            watchStatus={movie.watch_status}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
