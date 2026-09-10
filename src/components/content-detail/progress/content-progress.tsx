"use client";

import { useState } from "react";

import { ProgressActions } from "@/components/content-detail/progress/progress-actions";
import { ProgressMetrics } from "@/components/content-detail/progress/progress-metrics";
import { ProgressStatus } from "@/components/content-detail/progress/progress-status";
import { useProgressSeasons } from "@/hooks/title-details/use-progress-seasons";
import { canUpdateSeriesWatchActivity } from "@/lib/media/status";
import type { SeriesDetails } from "@/lib/types";
import { useAppSelector } from "@/store";

type ContentProgressProps = {
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function ContentProgress({
  series,
  type = "series",
}: ContentProgressProps) {
  const mediaId = series?.id;
  const entry = useAppSelector((state) =>
    mediaId === undefined
      ? undefined
      : state.contentDetails.series[String(mediaId)],
  );
  const { defaultSeasonNumber, seasons } = useProgressSeasons(series);
  const [pickedSeason, setPickedSeason] = useState<number | null>(null);
  const selectedSeason =
    pickedSeason !== null &&
    seasons.some((season) => season.seasonNumber === pickedSeason)
      ? pickedSeason
      : defaultSeasonNumber;
  const selectedSeasonDetails = seasons.find(
    (season) => season.seasonNumber === selectedSeason,
  );
  const canUpdateWatchActivity = canUpdateSeriesWatchActivity(series?.status);
  const isWatchActivityDisabled =
    !series?.is_present_in_watchlist || !canUpdateWatchActivity;

  return (
    <section className="m-2.5 sm:m-4 rounded-xl sm:rounded-[22px] border border-outline-variant bg-surface-container p-3.5 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      {type === "series" ? (
        <>
          <ProgressStatus
            id={mediaId}
            series={series}
            type={type}
            watchStatus={series?.watch_status}
            mutationStatus={entry?.mutationStatus}
            lastMutation={entry?.lastMutation}
            disabled={isWatchActivityDisabled}
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSeasonChange={setPickedSeason}
          />
          <div className="mt-5 h-px w-full bg-white/15" />
          <div className="mt-5">
            <ProgressMetrics series={series} selectedSeason={selectedSeason} />
          </div>
        </>
      ) : null}

      <div className={type === "series" ? "mt-6" : ""}>
        <ProgressActions
          disabled={isWatchActivityDisabled || !selectedSeasonDetails?.hasAired}
          episodeCount={selectedSeasonDetails?.episodeCount}
          episodesWatched={selectedSeasonDetails?.episodesWatched}
          id={mediaId}
          mutationStatus={entry?.mutationStatus}
          lastMutation={entry?.lastMutation}
          pendingProgress={entry?.pendingProgress}
          seasonNumber={selectedSeason}
        />
      </div>
    </section>
  );
}

export default ContentProgress;
