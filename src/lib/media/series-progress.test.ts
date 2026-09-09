import assert from "node:assert/strict";
import test from "node:test";

import type { LibrarySeriesSeason } from "@/lib/types";
import { calculateSeriesProgress } from "./series-progress";

const TODAY = "2026-09-09";

function season(
  seasonNumber: number,
  episodeCount: number,
  episodesWatched: number,
  airDate = "2026-01-01",
): LibrarySeriesSeason {
  return {
    season_number: seasonNumber,
    episode_count: episodeCount,
    episodes_watched: episodesWatched,
    air_date: airDate,
  };
}

test("excludes specials, future seasons, and invalid air dates", () => {
  const progress = calculateSeriesProgress(
    [
      season(0, 4, 2),
      season(1, 10, 3),
      season(2, 8, 0, "2027-01-01"),
      season(3, 6, 0, "invalid"),
    ],
    TODAY,
  );

  assert.deepEqual(progress, {
    completedSeasons: 0,
    totalSeasons: 1,
    episodesWatched: 3,
    totalEpisodes: 10,
    percentage: 30,
    nextEpisode: { seasonNumber: 1, episodeNumber: 4 },
  });
});

test("starts at the first episode of the first eligible season", () => {
  const progress = calculateSeriesProgress([season(1, 10, 0)], TODAY);

  assert.deepEqual(progress.nextEpisode, {
    seasonNumber: 1,
    episodeNumber: 1,
  });
});

test("moves to episode one of the next season", () => {
  const progress = calculateSeriesProgress(
    [season(1, 10, 10), season(2, 8, 0)],
    TODAY,
  );

  assert.equal(progress.completedSeasons, 1);
  assert.equal(progress.episodesWatched, 10);
  assert.equal(progress.totalEpisodes, 18);
  assert.deepEqual(progress.nextEpisode, {
    seasonNumber: 2,
    episodeNumber: 1,
  });
});

test("returns no next episode when all eligible seasons are complete", () => {
  const progress = calculateSeriesProgress(
    [season(1, 10, 10), season(2, 8, 8)],
    TODAY,
  );

  assert.equal(progress.percentage, 100);
  assert.equal(progress.completedSeasons, 2);
  assert.equal(progress.nextEpisode, null);
});

test("ignores zero-episode and missing-date seasons", () => {
  const noAirDate = season(2, 8, 0);
  noAirDate.air_date = null;

  const progress = calculateSeriesProgress(
    [season(1, 0, 0), noAirDate],
    TODAY,
  );

  assert.deepEqual(progress, {
    completedSeasons: 0,
    totalSeasons: 0,
    episodesWatched: 0,
    totalEpisodes: 0,
    percentage: 0,
    nextEpisode: null,
  });
});
