"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { CardImpressionToggle } from "@/components/custom/card-impression-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FALLBACK_POSTER,
  WATCH_STATUS,
  WATCH_STATUS_ICONS,
  WATCH_STATUS_INDICATOR,
  WATCH_STATUS_INDICATOR_TEXT,
} from "@/lib/constants";
import { getYearString, posterUrl } from "@/lib/media/display";
import { calculateSeriesProgress } from "@/lib/media/series-progress";
import { canUpdateSeriesWatchActivity } from "@/lib/media/status";
import type { LibrarySeries } from "@/lib/types";
import { cn, formatCountry, formatLanguage } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  libraryItemKey,
  libraryItemMutationRequested,
} from "@/store/slices/librarySlice";

function seriesMeta(series: LibrarySeries) {
  const language = series.original_language?.trim();
  const country = series.origin_country?.trim();
  const parts = [
    language ? formatLanguage(language) : null,
    country ? formatCountry(country) : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

export function SeriesCard({ series }: { series: LibrarySeries }) {
  const dispatch = useAppDispatch();
  const isPending = useAppSelector(
    (state) =>
      state.library.pending[libraryItemKey("series", series.tmdb_id)] !==
      undefined,
  );
  const progress = calculateSeriesProgress(series.seasons_info);
  const nextEpisode = progress.nextEpisode;
  const totalSeasons = series.total_number_of_seasons ?? 0;
  const completedSeasons = series.total_number_of_seasons_watched ?? 0;
  const episodesWatched = series.total_number_of_episodes_watched ?? 0;
  const totalEpisodes = series.total_number_of_episodes ?? 0;
  const percentage =
    totalEpisodes > 0
      ? Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100))
      : 0;

  const canUpdateWatchActivity = canUpdateSeriesWatchActivity(series.status);
  const status =
    WATCH_STATUS[series.watch_status as keyof typeof WATCH_STATUS] ??
    WATCH_STATUS[0];
  const statusIndicator =
    WATCH_STATUS_INDICATOR[series.watch_status] ?? WATCH_STATUS_INDICATOR[0];
  const StatusIcon =
    WATCH_STATUS_ICONS[
      series.watch_status as keyof typeof WATCH_STATUS_ICONS
    ] ?? WATCH_STATUS_ICONS[0];
  const rating = (series.vote_average ?? 0).toFixed(1);
  const meta = seriesMeta(series);
  const isNextDisabled =
    isPending || !canUpdateWatchActivity || nextEpisode === null;

  function updateImpression(impression: number | null) {
    dispatch(
      libraryItemMutationRequested({
        mediaType: "series",
        tmdbId: series.tmdb_id,
        impression,
      }),
    );
  }

  function markNextEpisodeWatched() {
    if (isNextDisabled || !nextEpisode) return;

    dispatch(
      libraryItemMutationRequested({
        mediaType: "series",
        tmdbId: series.tmdb_id,
        progress: nextEpisode,
      }),
    );
  }

  const nextEpisodeLabel = nextEpisode
    ? `Mark season ${nextEpisode.seasonNumber}, episode ${nextEpisode.episodeNumber} watched`
    : "All aired episodes watched";

  return (
    <Card className="group/card w-full min-w-0 gap-0 overflow-hidden rounded-[8px] border-0 bg-surface-container-low p-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5">
      <CardContent className="p-0">
        <Link
          aria-label={`View ${series.name} details`}
          className="relative block aspect-2/3 overflow-hidden bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary"
          href={`/series/${series.tmdb_id}`}
        >
          <Image
            alt={`${series.name} poster`}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            loading="eager"
            sizes="(max-width: 640px) 50vw, (max-width: 1720px) 20vw, 240px"
            src={posterUrl(series.poster_path, FALLBACK_POSTER)}
          />

          <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-surface-container-low/20 to-transparent" />

          <div className="absolute left-3 top-3 flex h-4.5 items-center justify-center rounded-xs bg-surface-container-low/80 px-2 py-0.5 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-3.75 text-brand-primary">
              {getYearString(series.first_air_date ?? undefined)}
            </span>
          </div>

          <div className="absolute right-3 top-3 flex h-4.5 max-h-4.75 items-center justify-center rounded-xs bg-surface-container px-1.5 py-0.75 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-3.75 text-brand-tertiary">
              ★ {rating}
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-0 flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-public-sans text-[10px] uppercase tracking-[0.35px] text-secondary font-semibold">
              <span>
                {completedSeasons}/{totalSeasons} seasons
              </span>
              <span>
                {episodesWatched}/{totalEpisodes} episodes
              </span>
            </div>
            <Progress
              className="h-1.5 rounded-[12px] bg-surface-container-high"
              value={percentage}
            />
          </div>
        </Link>
      </CardContent>

      <CardFooter className="h-[96.5px] flex-row items-end justify-between gap-2 rounded-none border-0 bg-surface-container-low px-3.5 py-3 text-on-surface">
        <Link
          className="flex min-w-0 flex-1 flex-col justify-end self-stretch rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          href={`/series/${series.tmdb_id}`}
          tabIndex={-1}
        >
          <h3 className="line-clamp-2 font-noto-sans text-[20px] font-semibold leading-6.5 text-on-surface">
            {series.name}
          </h3>
          {meta ? (
            <p className="mt-0.5 truncate font-public-sans text-[11px] leading-4 text-secondary">
              {meta}
            </p>
          ) : null}
        </Link>

        <div className="flex shrink-0 items-end gap-1">
          <span
            aria-label={status.display_value}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-surface-container-high"
            title={status.display_value}
          >
            <StatusIcon
              className={cn(
                "size-4",
                WATCH_STATUS_INDICATOR_TEXT[statusIndicator],
              )}
            />
          </span>
          <CardImpressionToggle
            disabled={isPending || !canUpdateWatchActivity}
            impression={series.impression}
            onSelect={updateImpression}
          />
          <Button
            aria-label={nextEpisodeLabel}
            disabled={isNextDisabled}
            onClick={markNextEpisodeWatched}
            size="icon"
            title={nextEpisodeLabel}
            type="button"
            variant="primaryFilled"
          >
            <Check />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
