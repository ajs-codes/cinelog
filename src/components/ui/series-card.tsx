"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardImpressionToggle } from "@/components/ui/card-impression-toggle";
import { MediaCard } from "@/components/ui/media-card";
import { Progress } from "@/components/ui/progress";
import { useLibraryItemMutation } from "@/hooks/library/use-library-item-mutation";
import {
  WATCH_STATUS,
  WATCH_STATUS_ICONS,
  WATCH_STATUS_INDICATOR,
  WATCH_STATUS_INDICATOR_TEXT,
} from "@/lib/constants";
import { formatMediaMeta, getYearString } from "@/lib/media/display";
import { calculateSeriesProgress } from "@/lib/media/series-progress";
import { canUpdateSeriesWatchActivity } from "@/lib/media/status";
import type { LibrarySeries } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SeriesCard({ series }: { series: LibrarySeries }) {
  const { isPending, requestMutation } = useLibraryItemMutation(
    "series",
    series.tmdb_id,
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
  const isNextDisabled =
    isPending || !canUpdateWatchActivity || nextEpisode === null;
  const nextEpisodeLabel = nextEpisode
    ? `Mark season ${nextEpisode.seasonNumber}, episode ${nextEpisode.episodeNumber} watched`
    : "All aired episodes watched";

  return (
    <MediaCard
      actions={
        <>
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
            onSelect={(impression) => requestMutation({ impression })}
          />
          <Button
            aria-label={nextEpisodeLabel}
            disabled={isNextDisabled}
            onClick={() => {
              if (isNextDisabled || !nextEpisode) return;
              requestMutation({ progress: nextEpisode });
            }}
            size="icon"
            title={nextEpisodeLabel}
            type="button"
            variant="primaryFilled"
          >
            <Check />
          </Button>
        </>
      }
      href={`/series/${series.tmdb_id}`}
      meta={formatMediaMeta(series.original_language, series.origin_country)}
      overlay={
        <div className="absolute inset-x-3 bottom-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-public-sans text-[10px] font-semibold tracking-[0.35px] text-secondary uppercase">
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
      }
      posterPath={series.poster_path}
      rating={(series.vote_average ?? 0).toFixed(1)}
      title={series.name}
      titleClassName="sm:text-[20px] sm:leading-6.5"
      year={getYearString(series.first_air_date ?? undefined)}
    />
  );
}
