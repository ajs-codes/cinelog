import { WATCH_STATUS } from "@/lib/constants";
import { AppError } from "@/lib/http/errors";
import { nowUnixSeconds } from "@/lib/media/display";
import { pickCastAndDirectors } from "@/lib/tmdb/credits";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { TmdbSeries } from "@/lib/types";
import type { SeriesPatchInput } from "@/lib/validations/library";
import {
  deleteUserSeries,
  findUserSeries,
  findUserSeriesImpression,
  insertUserSeries,
  listSeasonsBySeriesId,
  runInTransaction,
  updateSeasonById,
  updateSeasonsBySeriesId,
  updateSeriesById,
} from "@/repositories/series";
import type { NewSeries } from "@/db/schema";

export async function getSeriesDetails(tmdbId: number, userId?: number) {
  const queryParams = new URLSearchParams({
    append_to_response: "external_ids,content_ratings,credits",
    language: "en-US",
  });

  const seriesRecord = await tmdbFetch<TmdbSeries>(`/tv/${tmdbId}`, {
    searchParams: queryParams,
    failedMessage: "TMDB series request failed",
  });

  const credits = pickCastAndDirectors(seriesRecord.credits);
  const userSeries = userId
    ? await findUserSeriesImpression(tmdbId, userId)
    : undefined;

  return {
    backdrop_path: seriesRecord.backdrop_path,
    created_by: seriesRecord.created_by ?? [],
    first_air_date: seriesRecord.first_air_date,
    genres: seriesRecord.genres ?? [],
    id: seriesRecord.id,
    last_air_date: seriesRecord.last_air_date,
    name: seriesRecord.name,
    networks: seriesRecord.networks ?? [],
    number_of_episodes: seriesRecord.number_of_episodes,
    number_of_seasons: seriesRecord.number_of_seasons,
    overview: seriesRecord.overview,
    poster_path: seriesRecord.poster_path,
    production_companies: seriesRecord.production_companies ?? [],
    seasons: seriesRecord.seasons ?? [],
    status: seriesRecord.status,
    tagline: seriesRecord.tagline,
    type: seriesRecord.type,
    vote_average: seriesRecord.vote_average,
    original_language: seriesRecord.original_language,
    origin_country: seriesRecord.origin_country ?? [],
    imdb_id: seriesRecord.imdb_id ?? seriesRecord.external_ids?.imdb_id,
    content_ratings:
      seriesRecord.content_ratings?.results?.find(
        (rating) => rating.iso_3166_1 === "IN",
      ) ?? {},
    credits,
    is_present_in_watchlist: Boolean(userSeries),
    impression: userSeries?.impression ?? null,
  };
}

export async function addSeriesToLibrary(
  tmdbId: number,
  userId: number,
  body: TmdbSeries,
) {
  const existing = await findUserSeries(tmdbId, userId);

  if (existing) {
    throw new AppError("Series already exists in library", 409);
  }

  await insertUserSeries(tmdbId, userId, body);
}

export async function removeSeriesFromLibrary(tmdbId: number, userId: number) {
  const deleted = await deleteUserSeries(tmdbId, userId);

  if (deleted.length === 0) {
    throw new AppError("Series not found in library", 404);
  }
}

export async function updateSeriesInLibrary(
  tmdbId: number,
  userId: number,
  body: SeriesPatchInput,
) {
  const existingSeries = await findUserSeries(tmdbId, userId);

  if (!existingSeries) {
    throw new AppError("Series not found in library", 404);
  }

  const now = nowUnixSeconds();

  await runInTransaction(async (tx) => {
    let finalWatchStatus = existingSeries.watchStatus;
    let finalCompletedAt = existingSeries.completedAt;
    let finalLastWatchedAt = existingSeries.lastWatchedAt;
    let finalTotalEpsWatched =
      existingSeries.totalNumberOfEpisodesWatched || 0;
    let finalTotalSeasonsWatched =
      existingSeries.totalNumberOfSeasonsWatched || 0;

    let updateImpression = false;
    let newImpressionValue: number | null = existingSeries.impression;

    if (body.impression !== undefined) {
      updateImpression = true;
      newImpressionValue = body.impression;
    }

    const allSeasons = await listSeasonsBySeriesId(existingSeries.id, tx);
    let didProgressUpdate = false;

    if (
      body.mark_season_to_watched !== undefined &&
      body.mark_episode_to_watched !== undefined
    ) {
      const targetSeason = allSeasons.find(
        (s) => s.seasonNumber === body.mark_season_to_watched,
      );
      if (targetSeason) {
        let epsWatched = body.mark_episode_to_watched;
        if (epsWatched > targetSeason.episodeCount)
          epsWatched = targetSeason.episodeCount;
        if (epsWatched < 0) epsWatched = 0;

        const seasonCompletedAt =
          epsWatched === targetSeason.episodeCount && epsWatched > 0
            ? now
            : null;

        await updateSeasonById(
          targetSeason.id,
          {
            episodesWatched: epsWatched,
            lastWatchedAt: now,
            completedAt: seasonCompletedAt,
            updatedAt: now,
          },
          tx,
        );

        targetSeason.episodesWatched = epsWatched;
        targetSeason.completedAt = seasonCompletedAt;
        targetSeason.lastWatchedAt = now;
        didProgressUpdate = true;
      }
    }

    if (body.watch_status !== undefined) {
      finalWatchStatus = body.watch_status;
      const planToWatchValue =
        Object.values(WATCH_STATUS).find(
          (s) => s.display_value === "Plan to Watch",
        )?.value ?? 0;
      const completedValue =
        Object.values(WATCH_STATUS).find(
          (s) => s.display_value === "Completed",
        )?.value ?? 2;

      if (finalWatchStatus === planToWatchValue) {
        finalTotalEpsWatched = 0;
        finalTotalSeasonsWatched = 0;
        finalCompletedAt = null;
        finalLastWatchedAt = null;

        await updateSeasonsBySeriesId(
          existingSeries.id,
          {
            episodesWatched: 0,
            completedAt: null,
            lastWatchedAt: null,
            updatedAt: now,
          },
          tx,
        );
      } else if (finalWatchStatus === completedValue) {
        finalCompletedAt = now;
        finalLastWatchedAt = now;
        finalTotalEpsWatched = existingSeries.totalNumberOfEpisodes || 0;
        finalTotalSeasonsWatched = existingSeries.totalNumberOfSeasons || 0;

        for (const s of allSeasons) {
          await updateSeasonById(
            s.id,
            {
              episodesWatched: s.episodeCount,
              completedAt: now,
              lastWatchedAt: now,
              updatedAt: now,
            },
            tx,
          );
        }
      } else {
        finalCompletedAt = null;
      }
    } else if (didProgressUpdate) {
      finalTotalEpsWatched = allSeasons.reduce(
        (sum, s) => sum + s.episodesWatched,
        0,
      );
      finalTotalSeasonsWatched = allSeasons.filter(
        (s) => s.episodesWatched === s.episodeCount && s.episodeCount > 0,
      ).length;
      finalLastWatchedAt = now;

      const totalEps = existingSeries.totalNumberOfEpisodes || 0;
      if (totalEps > 0 && finalTotalEpsWatched >= totalEps) {
        const completedValue =
          Object.values(WATCH_STATUS).find(
            (s) => s.display_value === "Completed",
          )?.value ?? 2;
        finalWatchStatus = completedValue;
        finalCompletedAt = now;
      } else {
        const watchingValue =
          Object.values(WATCH_STATUS).find(
            (s) => s.display_value === "Watching",
          )?.value ?? 1;
        finalWatchStatus = watchingValue;
        finalCompletedAt = null;
      }
    }

    const seriesUpdate: Partial<NewSeries> = {
      watchStatus: finalWatchStatus,
      completedAt: finalCompletedAt,
      lastWatchedAt: finalLastWatchedAt,
      totalNumberOfEpisodesWatched: finalTotalEpsWatched,
      totalNumberOfSeasonsWatched: finalTotalSeasonsWatched,
      updatedAt: now,
    };

    if (updateImpression) {
      seriesUpdate.impression = newImpressionValue;
    }

    await updateSeriesById(existingSeries.id, seriesUpdate, tx);
  });

  return findUserSeries(tmdbId, userId);
}
