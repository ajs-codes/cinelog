import { desc, eq, asc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  genres,
  movies,
  moviesToGenres,
  seasons,
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
  totalNumberOfSeasonsWatched: number | null;
  posterPath: string | null;
  voteAverage: number | null;
  originalLanguage: string | null;
  originCountry: string | null;
  certificate: string | null;
  status: string | null;
  genres: string[];
};

export type UserSeasonRow = {
  tmdbId: number;
  seasonNumber: number;
  episodeCount: number;
  episodesWatched: number;
  airDate: string | null;
};

function attachGenres<T extends { id: number }>(
  rows: T[],
  genreRows: { parentId: number; genreName: string }[],
  key: "parentId",
): (T & { genres: string[] })[] {
  const genreMap = new Map<number, string[]>();
  for (const row of genreRows) {
    const list = genreMap.get(row[key]) || [];
    list.push(row.genreName);
    genreMap.set(row[key], list);
  }

  return rows.map((row) => ({
    ...row,
    genres: genreMap.get(row.id) || [],
  }));
}

export async function listLibraryRows(userId: number): Promise<{
  movies: UserMovieRow[];
  series: UserSeriesRow[];
  seasons: UserSeasonRow[];
}> {
  const db = getDb();
  const [userMovies, movieGenres, userSeries, seriesGenres, seasonRows] =
    await db.batch([
      db
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
        .orderBy(desc(movies.createdAt)),
      db
        .select({
          parentId: moviesToGenres.movieId,
          genreName: genres.name,
        })
        .from(moviesToGenres)
        .innerJoin(genres, eq(moviesToGenres.genreId, genres.id))
        .innerJoin(movies, eq(moviesToGenres.movieId, movies.id))
        .where(eq(movies.userId, userId)),
      db
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
          totalNumberOfSeasonsWatched: series.totalNumberOfSeasonsWatched,
          totalNumberOfEpisodesWatched: series.totalNumberOfEpisodesWatched,
          posterPath: series.posterPath,
          voteAverage: series.voteAverage,
          status: series.status,
          originalLanguage: series.originalLanguage,
          originCountry: series.originCountry,
          certificate: series.certificate,
        })
        .from(series)
        .where(eq(series.userId, userId))
        .orderBy(desc(series.createdAt)),
      db
        .select({
          parentId: seriesToGenres.seriesId,
          genreName: genres.name,
        })
        .from(seriesToGenres)
        .innerJoin(genres, eq(seriesToGenres.genreId, genres.id))
        .innerJoin(series, eq(seriesToGenres.seriesId, series.id))
        .where(eq(series.userId, userId)),
      db
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
        .orderBy(asc(series.tmdbId), asc(seasons.seasonNumber)),
    ]);

  return {
    movies: attachGenres(userMovies, movieGenres, "parentId"),
    series: attachGenres(userSeries, seriesGenres, "parentId"),
    seasons: seasonRows,
  };
}
