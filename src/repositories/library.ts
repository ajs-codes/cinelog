import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { movies, seasons, series } from "@/db/schema";

export async function listUserMovies(userId: number) {
  return getDb()
    .select({
      tmdbId: movies.tmdbId,
      watchStatus: movies.watchStatus,
      impression: movies.impression,
      createdAt: movies.createdAt,
      updatedAt: movies.updatedAt,
      completedAt: movies.completedAt,
      title: movies.title,
      posterPath: movies.posterPath,
      releaseDate: movies.releaseDate,
      voteAverage: movies.voteAverage,
      status: movies.status,
      originalLanguage: movies.originalLanguage,
      originCountry: movies.originCountry,
    })
    .from(movies)
    .where(eq(movies.userId, userId))
    .orderBy(desc(movies.createdAt));
}

export async function listUserSeries(userId: number) {
  return getDb()
    .select({
      tmdbId: series.tmdbId,
      watchStatus: series.watchStatus,
      impression: series.impression,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      lastWatchedAt: series.lastWatchedAt,
      completedAt: series.completedAt,
      name: series.name,
      firstAirDate: series.firstAirDate,
      lastAirDate: series.lastAirDate,
      totalNumberOfEpisodes: series.totalNumberOfEpisodes,
      totalNumberOfSeasons: series.totalNumberOfSeasons,
      totalNumberOfSeasonsWatched: series.totalNumberOfSeasonsWatched,
      totalNumberOfEpisodesWatched: series.totalNumberOfEpisodesWatched,
      posterPath: series.posterPath,
      voteAverage: series.voteAverage,
      status: series.status,
      originalLanguage: series.originalLanguage,
      originCountry: series.originCountry,
    })
    .from(series)
    .where(eq(series.userId, userId))
    .orderBy(desc(series.createdAt));
}

export async function listUserSeriesSeasons(userId: number) {
  return getDb()
    .select({
      tmdbId: series.tmdbId,
      seasonNumber: seasons.seasonNumber,
      episodeCount: seasons.episodeCount,
      episodesWatched: seasons.episodesWatched,
      airDate: seasons.airDate,
    })
    .from(seasons)
    .innerJoin(series, eq(seasons.seriesId, series.id))
    .where(eq(series.userId, userId))
    .orderBy(asc(series.tmdbId), asc(seasons.seasonNumber));
}
