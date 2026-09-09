import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { movies, series } from "@/db/schema";

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
      totalNumberOfEpisodesWatched: series.totalNumberOfEpisodesWatched,
      posterPath: series.posterPath,
      voteAverage: series.voteAverage,
      originalLanguage: series.originalLanguage,
    })
    .from(series)
    .where(eq(series.userId, userId))
    .orderBy(desc(series.createdAt));
}
