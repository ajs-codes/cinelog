import { and, eq, inArray, sql } from "drizzle-orm";
import { asBatch, getDb, type SqliteBatchQuery } from "@/db";
import {
  credits,
  genres,
  movies,
  moviesToGenres,
  productionCompanies,
} from "@/db/schema";
import { normalizeMovieStatus } from "@/lib/media/status";
import type { MoviePayload } from "@/lib/types";

function parentMovieIdSql(tmdbId: number, userId: number) {
  return sql`(select ${movies.id} from ${movies} where ${movies.tmdbId} = ${tmdbId} and ${movies.userId} = ${userId})`;
}

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
  const movieId = parentMovieIdSql(tmdbId, userId);
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
            movieId: movies.id,
            genreId: genres.id,
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

  const creditsToInsert = rawCredits.filter(
    (credit): credit is typeof credit & { id: number; name: string } =>
      Boolean(credit.id && credit.name),
  );

  if (creditsToInsert.length > 0) {
    queries.push(
      db.insert(credits).values(
        creditsToInsert.map((credit) => ({
          movieId,
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
            movieId,
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
