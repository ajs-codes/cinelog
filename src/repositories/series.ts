import { and, eq } from "drizzle-orm";
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
      typeof body.vote_average === "number"
        ? Math.round(body.vote_average * 10)
        : null;
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
        status: body.status || null,
        originalLanguage: body.original_language || null,
        originCountry: Array.isArray(body.origin_country)
          ? body.origin_country[0]
          : null,
        certificate: certificate || null,
        type: body.type || null,
      })
      .returning();

    if (body.genres && Array.isArray(body.genres)) {
      for (const genre of body.genres) {
        if (!genre.id || !genre.name) continue;

        await tx
          .insert(genres)
          .values({
            tmdbId: genre.id,
            name: genre.name,
          })
          .onConflictDoNothing();

        const g = await tx
          .select()
          .from(genres)
          .where(eq(genres.tmdbId, genre.id))
          .get();
        if (g) {
          await tx
            .insert(seriesToGenres)
            .values({
              seriesId: newSeries.id,
              genreId: g.id,
            })
            .onConflictDoNothing();
        }
      }
    }

    if (body.seasons && Array.isArray(body.seasons)) {
      for (const season of body.seasons) {
        if (!season.id || season.season_number === undefined) continue;
        await tx.insert(seasons).values({
          seriesId: newSeries.id,
          tmdbId: season.id,
          name: season.name || null,
          seasonNumber: season.season_number,
          episodeCount: season.episode_count || 0,
          airDate: season.air_date || null,
          createdAt: String(Math.floor(Date.now() / 1000)),
        });
      }
    }

    if (body.created_by && Array.isArray(body.created_by)) {
      for (const creator of body.created_by) {
        if (!creator.id || !creator.name) continue;
        await tx.insert(creators).values({
          seriesId: newSeries.id,
          tmdbId: creator.id,
          name: creator.name,
        });
      }
    }

    if (body.credits && Array.isArray(body.credits)) {
      for (const credit of body.credits) {
        if (!credit.id || !credit.name) continue;
        await tx.insert(credits).values({
          seriesId: newSeries.id,
          tmdbId: credit.id,
          name: credit.name,
          knownForDepartment: credit.known_for_department || "Acting",
        });
      }
    } else if (body.credits?.cast || body.credits?.crew) {
      const allCredits = [
        ...(body.credits.cast || []),
        ...(body.credits.crew || []),
      ];
      for (const credit of allCredits) {
        if (!credit.id || !credit.name) continue;
        await tx.insert(credits).values({
          seriesId: newSeries.id,
          tmdbId: credit.id,
          name: credit.name,
          knownForDepartment: credit.known_for_department || "Acting",
        });
      }
    }

    if (body.production_companies && Array.isArray(body.production_companies)) {
      for (const company of body.production_companies) {
        if (!company.id || !company.name) continue;
        await tx.insert(productionCompanies).values({
          seriesId: newSeries.id,
          tmdbId: company.id,
          name: company.name,
          originCountry: company.origin_country || null,
        });
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
