import { useMemo } from "react";

import type { SeriesDetails } from "@/lib/types";

export type SeasonOption = {
  episodeCount: number;
  episodesWatched: number;
  id: string | number;
  label: string;
  seasonNumber: number;
};

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hasAiredOnOrBeforeToday(airDate?: string | null) {
  if (!airDate) return false;

  const isoDate = airDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;

  return isoDate <= todayIsoDate();
}

export function useProgressSeasons(series?: SeriesDetails | null) {
  const seasons = useMemo<SeasonOption[]>(
    () =>
      (series?.seasons ?? [])
        .filter((season) => hasAiredOnOrBeforeToday(season.air_date))
        .map((season, index) => {
          const seasonNumber = season.season_number ?? index + 1;

          return {
            episodeCount: season.episode_count ?? 0,
            episodesWatched: season.episodes_watched ?? 0,
            id: season.id ?? seasonNumber,
            label: season.name ?? `${seasonNumber}`,
            seasonNumber,
          };
        }),
    [series?.seasons],
  );

  const defaultSeasonNumber =
    seasons.find((season) => season.seasonNumber > 0)?.seasonNumber ??
    seasons[0]?.seasonNumber ??
    1;

  return { defaultSeasonNumber, seasons };
}
