import { WATCH_STATUS } from "@/lib/constants";
import { AppError } from "@/lib/http/errors";
import { nowUnixSeconds } from "@/lib/media/display";
import { pickCastAndDirectors } from "@/lib/tmdb/credits";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { MoviePayload, TmdbMovie } from "@/lib/types";
import type { MoviePatchInput } from "@/lib/validations/library";
import type { NewMovie } from "@/db/schema";
import {
  deleteUserMovie,
  findUserMovie,
  findUserMovieImpression,
  insertUserMovie,
  updateUserMovie,
} from "@/repositories/movies";

export async function getMovieDetails(tmdbId: number, userId?: number) {
  const queryParams = new URLSearchParams({
    append_to_response: "release_dates,credits",
    language: "en-US",
  });

  const movie = await tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, {
    searchParams: queryParams,
    failedMessage: "TMDB movie request failed",
  });

  const credits = pickCastAndDirectors(movie.credits);
  const releaseResults = movie.release_dates?.results ?? [];
  const releaseCountry =
    releaseResults.find((release) => release.iso_3166_1 === "IN") ??
    releaseResults.find(
      (release) => release.iso_3166_1 === movie.origin_country?.[0],
    );

  const userMovie = userId
    ? await findUserMovieImpression(tmdbId, userId)
    : undefined;

  return {
    backdrop_path: movie.backdrop_path,
    belongs_to_collection: movie.belongs_to_collection,
    genres: movie.genres ?? [],
    id: movie.id,
    imdb_id: movie.imdb_id,
    overview: movie.overview,
    poster_path: movie.poster_path,
    production_companies: movie.production_companies ?? [],
    release_date: movie.release_date ?? null,
    certification: releaseCountry?.release_dates?.[0] ?? null,
    runtime: movie.runtime,
    status: movie.status,
    tagline: movie.tagline,
    title: movie.title,
    vote_average: movie.vote_average,
    original_language: movie.original_language,
    origin_country: movie.origin_country,
    credits,
    is_present_in_watchlist: Boolean(userMovie),
    impression: userMovie?.impression ?? null,
    watch_status: userMovie?.watchStatus ?? null,
  };
}

export async function addMovieToLibrary(
  tmdbId: number,
  userId: number,
  body: MoviePayload,
) {
  const existing = await findUserMovie(tmdbId, userId);

  if (existing) {
    throw new AppError("Movie already exists in library", 409);
  }

  await insertUserMovie(tmdbId, userId, body);
}

export async function removeMovieFromLibrary(tmdbId: number, userId: number) {
  const deleted = await deleteUserMovie(tmdbId, userId);

  if (deleted.length === 0) {
    throw new AppError("Movie not found in library", 404);
  }
}

export async function updateMovieInLibrary(
  tmdbId: number,
  userId: number,
  body: MoviePatchInput,
) {
  const updateData: Partial<NewMovie> = {};
  const now = nowUnixSeconds();
  updateData.updatedAt = now;

  if (body.watch_status !== undefined) {
    updateData.watchStatus = body.watch_status;
    const completedValue =
      Object.values(WATCH_STATUS).find((s) => s.display_value === "Completed")
        ?.value ?? 2;
    if (body.watch_status === completedValue) {
      updateData.completedAt = now;
    } else {
      updateData.completedAt = null;
    }
  }

  if (body.impression !== undefined) {
    updateData.impression = body.impression;
  }

  const updated = await updateUserMovie(tmdbId, userId, updateData);

  if (updated.length === 0) {
    throw new AppError("Movie not found in library", 404);
  }
}
