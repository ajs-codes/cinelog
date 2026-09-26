import "dotenv/config";

import { eq, inArray } from "drizzle-orm";
import { asBatch, getDb, type SqliteBatchQuery } from "@/db";
import {
  movies,
  series,
  smartCollectionFilters,
  smartCollections,
  userMovies,
  userSeasonProgress,
  userSeries,
} from "@/db/schema";
import { SMART_COLLECTIONS } from "@/lib/constants";

const DROPPED_WATCH_STATUS = 3;
const DROPPED_TOKEN = String(DROPPED_WATCH_STATUS);

type CleanupMode = "dry-run" | "execute";

type FilterRow = {
  id: number;
  operator: number;
  value: string;
  collectionId: number;
  collectionName: string;
  userId: number;
};

type FilterChange =
  | (FilterRow & { action: "rewrite"; to: string })
  | (FilterRow & { action: "delete" });

function parseMode(argv: string[]): CleanupMode {
  const index = argv.indexOf("--mode");
  const value = index >= 0 ? argv[index + 1] : "dry-run";

  if (value !== "dry-run" && value !== "execute") {
    throw new Error(`Invalid --mode "${value}". Use dry-run or execute.`);
  }

  return value;
}

function operatorKey(value: "eq" | "neq" | "in") {
  const entry = Object.entries(SMART_COLLECTIONS.operator).find(
    ([, operator]) => operator.value === value,
  );

  if (!entry) {
    throw new Error(`Missing smart collection operator "${value}"`);
  }

  return Number(entry[0]);
}

function splitValues(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function filterChange(row: FilterRow): FilterChange | null {
  const tokens = splitValues(row.value);
  if (!tokens.includes(DROPPED_TOKEN)) {
    return null;
  }

  const remaining = tokens.filter((token) => token !== DROPPED_TOKEN);
  if (row.operator === operatorKey("in") && remaining.length > 0) {
    return { ...row, action: "rewrite", to: remaining.join(",") };
  }

  return { ...row, action: "delete" };
}

function printFilterChange(change: FilterChange) {
  const label = `collection ${change.collectionId} "${change.collectionName}" user ${change.userId}`;

  if (change.action === "rewrite") {
    console.log(`  ${label}: rewrite "${change.value}" -> "${change.to}"`);
    return;
  }

  console.log(`  ${label}: delete clause "${change.value}"`);
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const db = getDb();

  const droppedMovies = await db
    .select({
      id: userMovies.id,
      userId: userMovies.userId,
      tmdbId: movies.tmdbId,
      title: movies.title,
    })
    .from(userMovies)
    .innerJoin(movies, eq(userMovies.movieId, movies.id))
    .where(eq(userMovies.watchStatus, DROPPED_WATCH_STATUS));

  const droppedSeries = await db
    .select({
      id: userSeries.id,
      userId: userSeries.userId,
      tmdbId: series.tmdbId,
      title: series.name,
    })
    .from(userSeries)
    .innerJoin(series, eq(userSeries.seriesId, series.id))
    .where(eq(userSeries.watchStatus, DROPPED_WATCH_STATUS));

  const seriesIds = droppedSeries.map((row) => row.id);
  const seasonProgress =
    seriesIds.length === 0
      ? []
      : await db
          .select({ id: userSeasonProgress.id })
          .from(userSeasonProgress)
          .where(inArray(userSeasonProgress.userSeriesId, seriesIds));

  const filterRows = await db
    .select({
      id: smartCollectionFilters.id,
      operator: smartCollectionFilters.operator,
      value: smartCollectionFilters.value,
      collectionId: smartCollections.id,
      collectionName: smartCollections.name,
      userId: smartCollections.userId,
    })
    .from(smartCollectionFilters)
    .innerJoin(
      smartCollections,
      eq(smartCollectionFilters.smartCollectionId, smartCollections.id),
    )
    .where(
      eq(
        smartCollectionFilters.field,
        SMART_COLLECTIONS.filter_field.watch_status.value,
      ),
    );

  const filterChanges = filterRows.flatMap((row) => {
    const change = filterChange(row);
    return change ? [change] : [];
  });

  console.log(`Mode: ${mode}`);
  console.log(`Dropped movies: ${droppedMovies.length}`);
  for (const movie of droppedMovies) {
    console.log(`  user ${movie.userId} tmdb ${movie.tmdbId} ${movie.title}`);
  }
  console.log(`Dropped series: ${droppedSeries.length}`);
  for (const show of droppedSeries) {
    console.log(`  user ${show.userId} tmdb ${show.tmdbId} ${show.title}`);
  }
  console.log(`Season progress rows: ${seasonProgress.length}`);
  console.log(`Smart collection filters: ${filterChanges.length}`);
  for (const change of filterChanges) {
    printFilterChange(change);
  }

  if (
    droppedMovies.length === 0 &&
    droppedSeries.length === 0 &&
    filterChanges.length === 0
  ) {
    console.log("Nothing to clean up.");
    return;
  }

  if (mode === "dry-run") {
    console.log("Dry run only. Re-run with --mode execute to apply.");
    return;
  }

  const queries: SqliteBatchQuery[] = [];

  if (seriesIds.length > 0) {
    queries.push(
      db
        .delete(userSeasonProgress)
        .where(inArray(userSeasonProgress.userSeriesId, seriesIds)),
    );
    queries.push(
      db.delete(userSeries).where(inArray(userSeries.id, seriesIds)),
    );
  }

  const movieIds = droppedMovies.map((row) => row.id);
  if (movieIds.length > 0) {
    queries.push(
      db.delete(userMovies).where(inArray(userMovies.id, movieIds)),
    );
  }

  for (const change of filterChanges) {
    if (change.action === "rewrite") {
      queries.push(
        db
          .update(smartCollectionFilters)
          .set({ value: change.to })
          .where(eq(smartCollectionFilters.id, change.id)),
      );
      continue;
    }

    queries.push(
      db
        .delete(smartCollectionFilters)
        .where(eq(smartCollectionFilters.id, change.id)),
    );
  }

  await db.batch(asBatch(queries));
  console.log("Cleanup applied.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
