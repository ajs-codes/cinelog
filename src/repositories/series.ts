import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  creators,
  credits,
  genres,
  productionCompanies,
  seasons,
  series,
  seriesToGenres,
} from "@/db/schema";
import type { Season, Series } from "@/db/schema";
import { normalizeSeriesStatus } from "@/lib/media/status";
import type { TmdbSeries } from "@/lib/types";

type Database = ReturnType<typeof getDb>;
export type DbTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
export type DbClient = Database | DbTransaction;

export async function runInTransaction<T>(
  fn: (tx: DbTransaction) => Promise<T>,
) {
  return getDb().transaction(fn);
}

export async function findUserSeriesImpression(tmdbId: number, userId: number) {
  return getDb()
    .select({
      impression: series.impression,
      watchStatus: series.watchStatus,
    })
    .from(series)
    .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
    .get();
}

export async function findUserSeriesTmdbIds(userId: number, tmdbIds: number[]) {
  if (tmdbIds.length === 0) return [];

  return getDb()
    .select({ tmdbId: series.tmdbId })
    .from(series)
    .where(and(eq(series.userId, userId), inArray(series.tmdbId, tmdbIds)));
}

export async function findUserSeries(tmdbId: number, userId: number) {
  return getDb()
    .select()
    .from(series)
    .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
    .get();
}

export async function listSeasonsBySeriesId(
  seriesId: number,
  db: DbClient = getDb(),
) {
  return db.select().from(seasons).where(eq(seasons.seriesId, seriesId)).all();
}

export async function updateSeasonById(
  seasonId: number,
  values: Partial<typeof seasons.$inferInsert>,
  db: DbClient = getDb(),
) {
  return db.update(seasons).set(values).where(eq(seasons.id, seasonId));
}

export async function updateSeasonsBySeriesId(
  seriesId: number,
  values: Partial<typeof seasons.$inferInsert>,
  db: DbClient = getDb(),
) {
  return db.update(seasons).set(values).where(eq(seasons.seriesId, seriesId));
}

export async function markAllSeasonsCompletedForSeries(
  seriesId: number,
  completedAt: string,
  db: DbClient = getDb(),
) {
  return db
    .update(seasons)
    .set({
      episodesWatched: seasons.episodeCount,
      completedAt,
      lastWatchedAt: completedAt,
      updatedAt: completedAt,
    })
    .where(eq(seasons.seriesId, seriesId));
}

export async function updateSeriesById(
  seriesId: number,
  values: Partial<typeof series.$inferInsert>,
  db: DbClient = getDb(),
) {
  return db.update(series).set(values).where(eq(series.id, seriesId));
}

export async function insertUserSeries(
  tmdbId: number,
  userId: number,
  body: TmdbSeries,
) {
  const db = getDb();

  await db.transaction(async (tx) => {
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

    const [newSeries] = await tx
      .insert(series)
      .values({
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
      })
      .returning();

    if (body.genres && Array.isArray(body.genres)) {
      const validGenres = body.genres.filter(
        (g): g is { id: number; name: string } => Boolean(g.id && g.name),
      );
      if (validGenres.length > 0) {
        await tx
          .insert(genres)
          .values(
            validGenres.map((g) => ({
              tmdbId: g.id,
              name: g.name,
            })),
          )
          .onConflictDoNothing();

        const matchedGenres = await tx
          .select({ id: genres.id })
          .from(genres)
          .where(
            inArray(
              genres.tmdbId,
              validGenres.map((g) => g.id),
            ),
          );

        if (matchedGenres.length > 0) {
          const genreLinks = matchedGenres.map((g) => ({
            seriesId: newSeries.id,
            genreId: g.id,
          }));
          await tx
            .insert(seriesToGenres)
            .values(genreLinks)
            .onConflictDoNothing();
        }
      }
    }

    if (body.seasons && Array.isArray(body.seasons)) {
      const nowString = String(Math.floor(Date.now() / 1000));
      const seasonsToInsert = body.seasons
        .filter(
          (
            season,
          ): season is typeof season & { id: number; season_number: number } =>
            season.id !== undefined && season.season_number !== undefined,
        )
        .map((season) => ({
          seriesId: newSeries.id,
          tmdbId: season.id,
          name: season.name || null,
          seasonNumber: season.season_number,
          episodeCount: season.episode_count || 0,
          airDate: season.air_date || null,
          createdAt: nowString,
        }));

      if (seasonsToInsert.length > 0) {
        await tx.insert(seasons).values(seasonsToInsert);
      }
    }

    if (body.created_by && Array.isArray(body.created_by)) {
      const creatorsToInsert = body.created_by
        .filter((creator): creator is { id: number; name: string } =>
          Boolean(creator.id && creator.name),
        )
        .map((creator) => ({
          seriesId: newSeries.id,
          tmdbId: creator.id,
          name: creator.name,
        }));

      if (creatorsToInsert.length > 0) {
        await tx.insert(creators).values(creatorsToInsert);
      }
    }

    const rawCredits =
      body.credits && Array.isArray(body.credits)
        ? body.credits
        : [...(body.credits?.cast || []), ...(body.credits?.crew || [])];

    const creditsToInsert = rawCredits
      .filter(
        (credit): credit is typeof credit & { id: number; name: string } =>
          Boolean(credit.id && credit.name),
      )
      .map((credit) => ({
        seriesId: newSeries.id,
        tmdbId: credit.id,
        name: credit.name,
        knownForDepartment: credit.known_for_department || "Acting",
      }));

    if (creditsToInsert.length > 0) {
      await tx.insert(credits).values(creditsToInsert);
    }

    if (body.production_companies && Array.isArray(body.production_companies)) {
      const companiesToInsert = body.production_companies
        .filter(
          (company): company is typeof company & { id: number; name: string } =>
            Boolean(company.id && company.name),
        )
        .map((company) => ({
          seriesId: newSeries.id,
          tmdbId: company.id,
          name: company.name,
          originCountry: company.origin_country || null,
        }));

      if (companiesToInsert.length > 0) {
        await tx.insert(productionCompanies).values(companiesToInsert);
      }
    }
  });
}

export async function deleteUserSeries(tmdbId: number, userId: number) {
  return getDb()
    .delete(series)
    .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
    .returning();
}

export type { Season, Series };
