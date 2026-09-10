import { and, eq, inArray, sql } from "drizzle-orm";
import { asBatch, getDb, type SqliteBatchQuery } from "@/db";
import {
  creators,
  credits,
  genres,
  productionCompanies,
  seasons,
  series,
  seriesToGenres,
} from "@/db/schema";
import type { NewSeries, Season, Series } from "@/db/schema";
import { normalizeSeriesStatus } from "@/lib/media/status";
import type { TmdbSeries } from "@/lib/types";

function parentSeriesIdSql(tmdbId: number, userId: number) {
  return sql`(select ${series.id} from ${series} where ${series.tmdbId} = ${tmdbId} and ${series.userId} = ${userId})`;
}

export async function findUserSeriesAndSeasons(
  tmdbId: number,
  userId: number,
): Promise<{ userSeries?: Series; userSeasons: Season[] }> {
  const db = getDb();
  const [seriesRows, seasonRows] = await db.batch([
    db
      .select()
      .from(series)
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId))),
    db
      .select({
        id: seasons.id,
        tmdbId: seasons.tmdbId,
        seriesId: seasons.seriesId,
        name: seasons.name,
        seasonNumber: seasons.seasonNumber,
        episodeCount: seasons.episodeCount,
        airDate: seasons.airDate,
        episodesWatched: seasons.episodesWatched,
        lastWatchedAt: seasons.lastWatchedAt,
        completedAt: seasons.completedAt,
        createdAt: seasons.createdAt,
        updatedAt: seasons.updatedAt,
      })
      .from(seasons)
      .innerJoin(series, eq(seasons.seriesId, series.id))
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId))),
  ]);

  return {
    userSeries: seriesRows[0],
    userSeasons: seasonRows,
  };
}

export async function applySeriesWatchUpdates(input: {
  seriesId: number;
  seriesValues: Partial<NewSeries>;
  seasonUpdate?: {
    seasonId: number;
    values: Partial<typeof seasons.$inferInsert>;
  };
  resetAllSeasons?: Partial<typeof seasons.$inferInsert>;
  completeAllSeasonsAt?: string;
}): Promise<Series> {
  const db = getDb();
  const queries: SqliteBatchQuery[] = [];

  if (input.seasonUpdate) {
    queries.push(
      db
        .update(seasons)
        .set(input.seasonUpdate.values)
        .where(eq(seasons.id, input.seasonUpdate.seasonId)),
    );
  }

  if (input.resetAllSeasons) {
    queries.push(
      db
        .update(seasons)
        .set(input.resetAllSeasons)
        .where(eq(seasons.seriesId, input.seriesId)),
    );
  }

  if (input.completeAllSeasonsAt) {
    const completedAt = input.completeAllSeasonsAt;
    queries.push(
      db
        .update(seasons)
        .set({
          episodesWatched: seasons.episodeCount,
          completedAt,
          lastWatchedAt: completedAt,
          updatedAt: completedAt,
        })
        .where(eq(seasons.seriesId, input.seriesId)),
    );
  }

  queries.push(
    db
      .update(series)
      .set(input.seriesValues)
      .where(eq(series.id, input.seriesId))
      .returning(),
  );

  const results = await db.batch(asBatch(queries));
  const updatedSeries = results[results.length - 1] as Series[];
  const seriesRow = updatedSeries[0];
  if (!seriesRow) {
    throw new Error("Failed to update series");
  }
  return seriesRow;
}

export async function insertUserSeries(
  tmdbId: number,
  userId: number,
  body: TmdbSeries,
) {
  const db = getDb();
  const seriesId = parentSeriesIdSql(tmdbId, userId);

  let certificate = null;
  if (body.content_ratings?.results) {
    const ratingCountry =
      body.content_ratings.results.find((r) => r.iso_3166_1 === "IN") ??
      body.content_ratings.results.find(
        (r) => r.iso_3166_1 === body.origin_country?.[0],
      );
    certificate = ratingCountry?.rating ?? null;
  }

  const voteAvg =
    typeof body.vote_average === "number" ? body.vote_average : null;
  const numEpisodes = body.number_of_episodes || null;
  const numSeasons = body.number_of_seasons || null;

  const queries: SqliteBatchQuery[] = [
    db.insert(series).values({
      tmdbId,
      userId,
      name: body.name || "Unknown",
      posterPath: body.poster_path || null,
      firstAirDate: body.first_air_date || null,
      lastAirDate: body.last_air_date || null,
      totalNumberOfEpisodes: numEpisodes,
      totalNumberOfSeasons: numSeasons,
      voteAverage: voteAvg,
      status: normalizeSeriesStatus(body.status),
      originalLanguage: body.original_language || null,
      originCountry: Array.isArray(body.origin_country)
        ? body.origin_country[0]
        : null,
      certificate: certificate || null,
      type: body.type || null,
    }),
  ];

  const genreTmdbIds = (body.genres ?? [])
    .map((genre) => genre.id)
    .filter((id): id is number => typeof id === "number");

  if (genreTmdbIds.length > 0) {
    queries.push(
      db.insert(seriesToGenres).select(
        db
          .select({
            seriesId: series.id,
            genreId: genres.id,
          })
          .from(series)
          .innerJoin(genres, inArray(genres.tmdbId, genreTmdbIds))
          .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId))),
      ),
    );
  }

  if (body.seasons && Array.isArray(body.seasons)) {
    const nowString = String(Math.floor(Date.now() / 1000));
    const seasonsToInsert = body.seasons.filter(
      (
        season,
      ): season is typeof season & { id: number; season_number: number } =>
        season.id !== undefined && season.season_number !== undefined,
    );

    if (seasonsToInsert.length > 0) {
      queries.push(
        db.insert(seasons).values(
          seasonsToInsert.map((season) => ({
            seriesId,
            tmdbId: season.id,
            name: season.name || null,
            seasonNumber: season.season_number,
            episodeCount: season.episode_count || 0,
            airDate: season.air_date || null,
            createdAt: nowString,
          })),
        ),
      );
    }
  }

  if (body.created_by && Array.isArray(body.created_by)) {
    const creatorsToInsert = body.created_by.filter(
      (creator): creator is { id: number; name: string } =>
        Boolean(creator.id && creator.name),
    );

    if (creatorsToInsert.length > 0) {
      queries.push(
        db.insert(creators).values(
          creatorsToInsert.map((creator) => ({
            seriesId,
            tmdbId: creator.id,
            name: creator.name,
          })),
        ),
      );
    }
  }

  const rawCredits =
    body.credits && Array.isArray(body.credits)
      ? body.credits
      : [...(body.credits?.cast || []), ...(body.credits?.crew || [])];

  const creditsToInsert = rawCredits.filter(
    (credit): credit is typeof credit & { id: number; name: string } =>
      Boolean(credit.id && credit.name),
  );

  if (creditsToInsert.length > 0) {
    queries.push(
      db.insert(credits).values(
        creditsToInsert.map((credit) => ({
          seriesId,
          tmdbId: credit.id,
          name: credit.name,
          knownForDepartment: credit.known_for_department || "Acting",
        })),
      ),
    );
  }

  if (body.production_companies && Array.isArray(body.production_companies)) {
    const companiesToInsert = body.production_companies.filter(
      (company): company is typeof company & { id: number; name: string } =>
        Boolean(company.id && company.name),
    );

    if (companiesToInsert.length > 0) {
      queries.push(
        db.insert(productionCompanies).values(
          companiesToInsert.map((company) => ({
            seriesId,
            tmdbId: company.id,
            name: company.name,
            originCountry: company.origin_country || null,
          })),
        ),
      );
    }
  }

  await db.batch(asBatch(queries));
}

export async function deleteUserSeries(tmdbId: number, userId: number) {
  return getDb()
    .delete(series)
    .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
    .returning();
}

export type { Season, Series };
