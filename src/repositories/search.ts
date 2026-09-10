import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { genres, movies, series } from "@/db/schema";
import type { SearchType } from "@/lib/types";

export async function findSearchLookups(
  type: SearchType,
  genreIds: number[],
  tmdbIds: number[],
  userId?: number,
) {
  if (genreIds.length === 0 && (!userId || tmdbIds.length === 0)) {
    return { genreRows: [], watchlistedTmdbIds: new Set<number>() };
  }

  const db = getDb();
  const shouldLoadWatchlist = Boolean(userId && tmdbIds.length > 0);
  const watchlistQuery =
    type === "movie"
      ? db
          .select({ tmdbId: movies.tmdbId })
          .from(movies)
          .where(
            and(eq(movies.userId, userId ?? 0), inArray(movies.tmdbId, tmdbIds)),
          )
      : db
          .select({ tmdbId: series.tmdbId })
          .from(series)
          .where(
            and(
              eq(series.userId, userId ?? 0),
              inArray(series.tmdbId, tmdbIds),
            ),
          );

  if (genreIds.length === 0) {
    const watchlistRows = await watchlistQuery;
    return {
      genreRows: [],
      watchlistedTmdbIds: new Set(watchlistRows.map((row) => row.tmdbId)),
    };
  }

  const genreQuery = db
    .select({ tmdbId: genres.tmdbId, name: genres.name })
    .from(genres)
    .where(inArray(genres.tmdbId, genreIds));

  if (!shouldLoadWatchlist) {
    const genreRows = await genreQuery;
    return { genreRows, watchlistedTmdbIds: new Set<number>() };
  }

  const [genreRows, watchlistRows] = await db.batch([
    genreQuery,
    watchlistQuery,
  ]);

  return {
    genreRows,
    watchlistedTmdbIds: new Set(watchlistRows.map((row) => row.tmdbId)),
  };
}
