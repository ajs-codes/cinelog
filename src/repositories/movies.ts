import { and, eq, inArray, sql } from "drizzle-orm";
import { asBatch, getDb, type SqliteBatchQuery } from "@/db";
import {
  credits,
  genres,
  movies,
  moviesToCredits,
  moviesToGenres,
  moviesToProductionCompanies,
  productionCompanies,
} from "@/db/schema";
import { normalizeMovieStatus } from "@/lib/media/status";
import type { MoviePayload } from "@/lib/types";

export async function findUserMovieImpression(tmdbId: number, userId: number) {
  return getDb()
    .select({
      impression: movies.impression,
      watchStatus: movies.watchStatus,
    })
    .from(movies)
    .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
    .get();
}

export async function findUserMovie(tmdbId: number, userId: number) {
  return getDb()
    .select()
    .from(movies)
    .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
    .get();
}

export async function insertUserMovie(
  tmdbId: number,
  userId: number,
  body: MoviePayload,
) {
  const db = getDb();
  const certificate = body.certification?.certification || null;
  const voteAvg =
    typeof body.vote_average === "number" ? body.vote_average : null;
  const releaseDateRaw = body.release_date || null;

  const queries: SqliteBatchQuery[] = [
    db.insert(movies).values({
      tmdbId,
      userId,
      title: body.title || "Unknown",
      posterPath: body.poster_path || null,
      releaseDate: releaseDateRaw || null,
      voteAverage: voteAvg,
      status: normalizeMovieStatus(body.status),
      originalLanguage: body.original_language || null,
      originCountry: body.origin_country?.[0] || null,
      certificate: certificate || null,
    }),
  ];

  const genreTmdbIds = (body.genres ?? [])
    .map((genre) => genre.id)
    .filter((id): id is number => typeof id === "number");

  if (genreTmdbIds.length > 0) {
    queries.push(
      db.insert(moviesToGenres).select(
        db
          .select({
            id: sql<number | null>`null`.as("id"),
            movieId: movies.id,
            genreId: genres.id,
            createdAt: sql`(unixepoch())`.as("createdAt"),
          })
          .from(movies)
          .innerJoin(genres, inArray(genres.tmdbId, genreTmdbIds))
          .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId))),
      ),
    );
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
      db.insert(moviesToCredits).select(
        db
          .select({
            id: sql<number | null>`null`.as("id"),
            movieId: movies.id,
            creditId: credits.id,
            createdAt: sql`(unixepoch())`.as("createdAt"),
          })
          .from(movies)
          .innerJoin(credits, inArray(credits.tmdbId, creditTmdbIds))
          .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId))),
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
        db.insert(moviesToProductionCompanies).select(
          db
            .select({
              id: sql<number | null>`null`.as("id"),
              movieId: movies.id,
              companyId: productionCompanies.id,
              createdAt: sql`(unixepoch())`.as("createdAt"),
            })
            .from(movies)
            .innerJoin(
              productionCompanies,
              inArray(productionCompanies.tmdbId, companyTmdbIds),
            )
            .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId))),
        ),
      );
    }
  }

  await db.batch(asBatch(queries));
}

export async function deleteUserMovie(tmdbId: number, userId: number) {
  return getDb()
    .delete(movies)
    .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
    .returning();
}

export async function updateUserMovie(
  tmdbId: number,
  userId: number,
  updateData: Partial<typeof movies.$inferInsert>,
) {
  return getDb()
    .update(movies)
    .set(updateData)
    .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
    .returning();
}
