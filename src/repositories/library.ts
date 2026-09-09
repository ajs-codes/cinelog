import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  genres,
  movies,
  moviesToGenres,
  series,
  seriesToGenres,
} from "@/db/schema";

export type UserMovieRow = {
  id: number;
  tmdbId: number;
  watchStatus: number;
  impression: number | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  status: string | null;
  originalLanguage: string | null;
  originCountry: string | null;
  certificate: string | null;
  genres: string[];
};

export type UserSeriesRow = {
  id: number;
  tmdbId: number;
  watchStatus: number;
  impression: number | null;
  createdAt: string;
  updatedAt: string | null;
  lastWatchedAt: string | null;
  completedAt: string | null;
  name: string;
  firstAirDate: string | null;
  lastAirDate: string | null;
  totalNumberOfEpisodes: number | null;
  totalNumberOfSeasons: number | null;
  totalNumberOfEpisodesWatched: number | null;
  posterPath: string | null;
  voteAverage: number | null;
  originalLanguage: string | null;
  originCountry: string | null;
  certificate: string | null;
  genres: string[];
};

export async function listUserMovies(
  userId: number,
): Promise<UserMovieRow[]> {
  const userMovies = await getDb()
    .select({
      id: movies.id,
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
      certificate: movies.certificate,
    })
    .from(movies)
    .where(eq(movies.userId, userId))
    .orderBy(desc(movies.createdAt));

  if (userMovies.length === 0) return [];

  const movieIds = userMovies.map((m) => m.id);
  const movieGenres = await getDb()
    .select({
      movieId: moviesToGenres.movieId,
      genreName: genres.name,
    })
    .from(moviesToGenres)
    .innerJoin(genres, eq(moviesToGenres.genreId, genres.id))
    .where(inArray(moviesToGenres.movieId, movieIds));

  const genreMap = new Map<number, string[]>();
  for (const row of movieGenres) {
    const list = genreMap.get(row.movieId) || [];
    list.push(row.genreName);
    genreMap.set(row.movieId, list);
  }

  return userMovies.map((m) => ({
    ...m,
    genres: genreMap.get(m.id) || [],
  }));
}

export async function listUserSeries(
  userId: number,
): Promise<UserSeriesRow[]> {
  const userSeries = await getDb()
    .select({
      id: series.id,
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
      originCountry: series.originCountry,
      certificate: series.certificate,
    })
    .from(series)
    .where(eq(series.userId, userId))
    .orderBy(desc(series.createdAt));

  if (userSeries.length === 0) return [];

  const seriesIds = userSeries.map((s) => s.id);
  const seriesGenres = await getDb()
    .select({
      seriesId: seriesToGenres.seriesId,
      genreName: genres.name,
    })
    .from(seriesToGenres)
    .innerJoin(genres, eq(seriesToGenres.genreId, genres.id))
    .where(inArray(seriesToGenres.seriesId, seriesIds));

  const genreMap = new Map<number, string[]>();
  for (const row of seriesGenres) {
    const list = genreMap.get(row.seriesId) || [];
    list.push(row.genreName);
    genreMap.set(row.seriesId, list);
  }

  return userSeries.map((s) => ({
    ...s,
    genres: genreMap.get(s.id) || [],
  }));
}
