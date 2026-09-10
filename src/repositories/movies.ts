import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  credits,
  genres,
  movies,
  moviesToGenres,
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

export async function findUserMovieTmdbIds(userId: number, tmdbIds: number[]) {
  if (tmdbIds.length === 0) return [];

  return getDb()
    .select({ tmdbId: movies.tmdbId })
    .from(movies)
    .where(and(eq(movies.userId, userId), inArray(movies.tmdbId, tmdbIds)));
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

  await db.transaction(async (tx) => {
    const certificate = body.certification?.certification || null;
    const voteAvg =
      typeof body.vote_average === "number" ? body.vote_average : null;
    const releaseDateRaw = body.release_date || null;

    const [newMovie] = await tx
      .insert(movies)
      .values({
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
            movieId: newMovie.id,
            genreId: g.id,
          }));
          await tx
            .insert(moviesToGenres)
            .values(genreLinks)
            .onConflictDoNothing();
        }
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
        movieId: newMovie.id,
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
          movieId: newMovie.id,
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
