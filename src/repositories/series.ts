import { and, eq, inArray, sql } from "drizzle-orm";
import { asBatch, getDb, type SqliteBatchQuery } from "@/db";
import {
  creators,
  credits,
  genres,
  productionCompanies,
  seasons,
  series,
  seriesToCreators,
  seriesToCredits,
  seriesToGenres,
  seriesToProductionCompanies,
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
            id: sql<number | null>`null`.as("id"),
            seriesId: series.id,
            genreId: genres.id,
            createdAt: sql`(unixepoch())`.as("createdAt"),
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
    const uniqueCreatorsMap = new Map<number, { id: number; name: string }>();
    for (const creator of body.created_by) {
      if (creator?.id && creator?.name && !uniqueCreatorsMap.has(creator.id)) {
        uniqueCreatorsMap.set(creator.id, {
          id: creator.id,
          name: creator.name,
        });
      }
    }
    const creatorsToInsert = Array.from(uniqueCreatorsMap.values());
    const creatorTmdbIds = creatorsToInsert.map((c) => c.id);

    if (creatorsToInsert.length > 0) {
      queries.push(
        db
          .insert(creators)
          .values(
            creatorsToInsert.map((creator) => ({
              tmdbId: creator.id,
              name: creator.name,
            })),
          )
          .onConflictDoNothing(),
      );

      queries.push(
        db.insert(seriesToCreators).select(
          db
            .select({
              id: sql<number | null>`null`.as("id"),
              seriesId: series.id,
              creatorId: creators.id,
              createdAt: sql`(unixepoch())`.as("createdAt"),
            })
            .from(series)
            .innerJoin(creators, inArray(creators.tmdbId, creatorTmdbIds))
            .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId))),
        ),
      );
    }
  }

  const rawCredits =
    body.credits && Array.isArray(body.credits)
      ? body.credits
      : [...(body.credits?.cast || []), ...(body.credits?.crew || [])];

  const uniqueCreditsMap = new Map<
    number,
    { id: number; name: string; known_for_department?: string }
  >();
  for (const credit of rawCredits) {
    if (credit?.id && credit?.name && !uniqueCreditsMap.has(credit.id)) {
      uniqueCreditsMap.set(credit.id, {
        id: credit.id,
        name: credit.name,
        known_for_department: credit.known_for_department,
      });
    }
  }
  const creditsToInsert = Array.from(uniqueCreditsMap.values());
  const creditTmdbIds = creditsToInsert.map((c) => c.id);

  if (creditsToInsert.length > 0) {
    queries.push(
      db
        .insert(credits)
        .values(
          creditsToInsert.map((credit) => ({
            tmdbId: credit.id,
            name: credit.name,
            knownForDepartment: credit.known_for_department || "Acting",
          })),
        )
        .onConflictDoNothing(),
    );

    queries.push(
      db.insert(seriesToCredits).select(
        db
          .select({
            id: sql<number | null>`null`.as("id"),
            seriesId: series.id,
            creditId: credits.id,
            createdAt: sql`(unixepoch())`.as("createdAt"),
          })
          .from(series)
          .innerJoin(credits, inArray(credits.tmdbId, creditTmdbIds))
          .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId))),
      ),
    );
  }

  if (body.production_companies && Array.isArray(body.production_companies)) {
    const uniqueCompaniesMap = new Map<
      number,
      { id: number; name: string; origin_country?: string }
    >();
    for (const company of body.production_companies) {
      if (company?.id && company?.name && !uniqueCompaniesMap.has(company.id)) {
        uniqueCompaniesMap.set(company.id, {
          id: company.id,
          name: company.name,
          origin_country: company.origin_country,
        });
      }
    }
    const companiesToInsert = Array.from(uniqueCompaniesMap.values());
    const companyTmdbIds = companiesToInsert.map((c) => c.id);

    if (companiesToInsert.length > 0) {
      queries.push(
        db
          .insert(productionCompanies)
          .values(
            companiesToInsert.map((company) => ({
              tmdbId: company.id,
              name: company.name,
              originCountry: company.origin_country || null,
            })),
          )
          .onConflictDoNothing(),
      );

      queries.push(
        db.insert(seriesToProductionCompanies).select(
          db
            .select({
              id: sql<number | null>`null`.as("id"),
              seriesId: series.id,
              companyId: productionCompanies.id,
              createdAt: sql`(unixepoch())`.as("createdAt"),
            })
            .from(series)
            .innerJoin(
              productionCompanies,
              inArray(productionCompanies.tmdbId, companyTmdbIds),
            )
            .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId))),
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
