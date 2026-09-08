import { useMemo } from "react";

import type { SeriesDetails } from "@/lib/types";

export type SeasonOption = {
  episodeCount: number;
  episodesWatched: number;
  id: string | number;
  label: string;
  seasonNumber: number;
};

export function useProgressSeasons(series?: SeriesDetails | null) {
  const seasons = useMemo<SeasonOption[]>(
    () =>
      (series?.seasons ?? []).map((season, index) => {
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
