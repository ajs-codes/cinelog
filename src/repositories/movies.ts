import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  credits,
  genres,
  movies,
  moviesToGenres,
  productionCompanies,
} from "@/db/schema";
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

  await db.transaction(async (tx) => {
    const certificate = body.certification?.certification || null;
    const voteAvg =
      typeof body.vote_average === "number"
        ? Math.round(body.vote_average * 10)
        : null;
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
        status: body.status || null,
        originalLanguage: body.original_language || null,
        originCountry: body.origin_country?.[0] || null,
        certificate: certificate || null,
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
            .insert(moviesToGenres)
            .values({
              movieId: newMovie.id,
              genreId: g.id,
            })
            .onConflictDoNothing();
        }
      }
    }

    if (body.credits && Array.isArray(body.credits)) {
      for (const credit of body.credits) {
        if (!credit.id || !credit.name) continue;
        await tx.insert(credits).values({
          movieId: newMovie.id,
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
          movieId: newMovie.id,
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
          movieId: newMovie.id,
          tmdbId: company.id,
          name: company.name,
          originCountry: company.origin_country || null,
        });
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
