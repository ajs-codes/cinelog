import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getDb } from "@/db";
import { WATCH_STATUS, IMPRESSION } from "@/lib/constants";

import {
  movies,
  genres,
  moviesToGenres,
  credits,
  productionCompanies,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TmdbCastMember = {
  id?: number;
  name?: string;
  order?: number;
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbCrewMember = {
  id?: number;
  name?: string;
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbReleaseDate = {
  certification?: string | null;
  descriptors?: string[];
  iso_639_1?: string | null;
  note?: string | null;
  release_date?: string;
  type?: number;
};

type TmdbMovie = {
  backdrop_path?: string | null;
  belongs_to_collection?: unknown;
  genres?: Array<{ id?: number; name?: string }> | null;
  id?: number;
  imdb_id?: string | null;
  overview?: string;
  poster_path?: string | null;
  production_companies?: Array<{
    id?: number;
    name?: string;
    origin_country?: string;
  }> | null;
  release_date?: string;
  runtime?: number | null;
  status?: string;
  tagline?: string | null;
  title?: string;
  vote_average?: number;
  original_language?: string | null;
  origin_country?: string[] | null;
  release_dates?: {
    results?: Array<{
      iso_3166_1?: string;
      release_dates?: TmdbReleaseDate[];
      [key: string]: unknown;
    }>;
  };
  credits?:
    | {
        cast?: TmdbCastMember[];
        crew?: TmdbCrewMember[];
      }
    | Array<{ id?: number; name?: string; known_for_department?: string }>;
};

type MoviePayload = Omit<TmdbMovie, "release_dates"> & {
  certification?: TmdbReleaseDate | null;
};

function getMovieFields(movie: TmdbMovie) {
  const creditsObj =
    movie.credits && !Array.isArray(movie.credits) ? movie.credits : undefined;
  const cast = [...(creditsObj?.cast ?? [])]
    .sort(
      (first, second) => (first.order ?? Infinity) - (second.order ?? Infinity),
    )
    .slice(0, 10);
  const directingCrew: TmdbCrewMember[] = [];
  for (const member of creditsObj?.crew ?? []) {
    if (member.known_for_department !== "Directing") continue;

    directingCrew.push(member);
    if (directingCrew.length === 5) break;
  }

  const releaseResults = movie.release_dates?.results ?? [];
  const releaseCountry =
    releaseResults.find((release) => release.iso_3166_1 === "IN") ??
    releaseResults.find(
      (release) => release.iso_3166_1 === movie.origin_country?.[0],
    );

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
    credits: [...cast, ...directingCrew],
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 503 },
    );
  }

  const queryParams = new URLSearchParams({
    append_to_response: "release_dates,credits",
    language: "en-US",
  });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?${queryParams.toString()}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDB movie request failed" },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const movie = (await response.json()) as TmdbMovie;
    return NextResponse.json(getMovieFields(movie));
  } catch {
    return NextResponse.json(
      { error: "TMDB movie request failed" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = payload.userId;

  let body: MoviePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();

  try {
    const existing = await db
      .select()
      .from(movies)
      .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: "Movie already exists in library" },
        { status: 409 },
      );
    }

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

      if (
        body.production_companies &&
        Array.isArray(body.production_companies)
      ) {
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

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to insert movie:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = payload.userId;

  const db = getDb();

  try {
    const deleted = await db
      .delete(movies)
      .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Movie not found in library" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete movie:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = payload.userId;

  let body: { watch_status?: number; impression?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();

  try {
    const updateData: Partial<typeof movies.$inferInsert> = {};
    const now = String(Math.floor(Date.now() / 1000));
    updateData.updatedAt = now;

    if (body.watch_status !== undefined) {
      const validStatuses: number[] = Object.values(WATCH_STATUS).map(
        (s) => s.value,
      );
      if (!validStatuses.includes(body.watch_status)) {
        return NextResponse.json(
          { error: "Invalid watch_status" },
          { status: 400 },
        );
      }
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
      const validImpressions: number[] = Object.values(IMPRESSION).map(
        (i) => i.value,
      );
      if (
        body.impression !== null &&
        !validImpressions.includes(body.impression)
      ) {
        return NextResponse.json(
          { error: "Invalid impression" },
          { status: 400 },
        );
      }
      updateData.impression = body.impression;
    }

    if (Object.keys(updateData).length === 1) {
      // Only updatedAt is present, meaning no valid fields were passed
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(movies)
      .set(updateData)
      .where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Movie not found in library" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update movie:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
