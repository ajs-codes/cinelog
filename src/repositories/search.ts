import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { genres, movies, series } from "@/db/schema";
import type { SearchType } from "@/lib/types";

const emptyLookups = {
  genreRows: [] as Array<{ tmdbId: number; name: string }>,
  watchlistedTmdbIds: new Set<number>(),
  watchStatusByTmdbId: new Map<number, number>(),
};

function watchlistMaps(rows: Array<{ tmdbId: number; watchStatus: number }>) {
  return {
    watchlistedTmdbIds: new Set(rows.map((row) => row.tmdbId)),
    watchStatusByTmdbId: new Map(
      rows.map((row) => [row.tmdbId, row.watchStatus]),
    ),
  };
}

export async function findSearchLookups(
  type: SearchType,
  genreIds: number[],
  tmdbIds: number[],
  userId?: number,
) {
  if (genreIds.length === 0 && (!userId || tmdbIds.length === 0)) {
    return emptyLookups;
  }

  const db = getDb();
  const shouldLoadWatchlist = Boolean(userId && tmdbIds.length > 0);
  const watchlistQuery =
    type === "movie"
      ? db
          .select({ tmdbId: movies.tmdbId, watchStatus: movies.watchStatus })
          .from(movies)
          .where(
            and(eq(movies.userId, userId ?? 0), inArray(movies.tmdbId, tmdbIds)),
          )
      : db
          .select({ tmdbId: series.tmdbId, watchStatus: series.watchStatus })
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
      ...watchlistMaps(watchlistRows),
    };
  }

  const genreQuery = db
    .select({ tmdbId: genres.tmdbId, name: genres.name })
    .from(genres)
    .where(inArray(genres.tmdbId, genreIds));

  if (!shouldLoadWatchlist) {
    const genreRows = await genreQuery;
    return {
      genreRows,
      watchlistedTmdbIds: new Set<number>(),
      watchStatusByTmdbId: new Map<number, number>(),
    };
  }

  const [genreRows, watchlistRows] = await db.batch([
    genreQuery,
    watchlistQuery,
  ]);

  return {
    genreRows,
    ...watchlistMaps(watchlistRows),
  };
}
