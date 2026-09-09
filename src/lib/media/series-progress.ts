import type { LibrarySeriesSeason } from "@/lib/types";

type NextEpisode = {
  seasonNumber: number;
  episodeNumber: number;
};

export type SeriesProgress = {
  completedSeasons: number;
  totalSeasons: number;
  episodesWatched: number;
  totalEpisodes: number;
  percentage: number;
  nextEpisode: NextEpisode | null;
};

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function calculateSeriesProgress(
  seasons: LibrarySeriesSeason[],
  today = todayIsoDate(),
): SeriesProgress {
  const eligibleSeasons = seasons
    .filter((season) => {
      const airDate = season.air_date?.slice(0, 10);
      return (
        season.season_number > 0 &&
        season.episode_count > 0 &&
        airDate !== undefined &&
        isValidIsoDate(airDate) &&
        airDate <= today
      );
    })
    .sort((a, b) => a.season_number - b.season_number);

  let completedSeasons = 0;
  let episodesWatched = 0;
  let totalEpisodes = 0;
  let nextEpisode: NextEpisode | null = null;

  for (const season of eligibleSeasons) {
    const watched = Math.min(
      Math.max(season.episodes_watched, 0),
      season.episode_count,
    );

    totalEpisodes += season.episode_count;
    episodesWatched += watched;

    if (watched === season.episode_count) {
      completedSeasons += 1;
    } else if (!nextEpisode) {
      nextEpisode = {
        seasonNumber: season.season_number,
        episodeNumber: watched + 1,
      };
    }
  }

  return {
    completedSeasons,
    totalSeasons: eligibleSeasons.length,
    episodesWatched,
    totalEpisodes,
    percentage:
      totalEpisodes > 0
        ? Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100))
        : 0,
    nextEpisode,
  };
}
