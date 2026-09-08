import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { movies, series } from "@/db/schema";
import { verifyToken } from "@/lib/auth/jwt";
import { TMDB_POSTER_BASE_URL, WATCH_STATUS } from "@/lib/constants";
import type { MovieCardData } from "@/components/custom/movie-card";

export const dynamic = "force-dynamic";

const FALLBACK_POSTER = "/file.svg";

function getYear(date: string | null) {
  return date ? Number(date.slice(0, 4)) : 0;
}

function getCompletion(
  status: number,
  watched = 0,
  total: number | null = null,
) {
  if (total && total > 0) {
    return Math.min(100, Math.round((watched / total) * 100));
  }

  return status === WATCH_STATUS[2].value ? 100 : 0;
}

function getPoster(path: string | null) {
  return path ? `${TMDB_POSTER_BASE_URL}${path}` : FALLBACK_POSTER;
}

export async function GET() {
  const token = (await cookies()).get("auth_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const [movieRows, seriesRows] = await Promise.all([
      db
        .select()
        .from(movies)
        .where(eq(movies.userId, payload.userId))
        .orderBy(desc(movies.createdAt)),
      db
        .select()
        .from(series)
        .where(eq(series.userId, payload.userId))
        .orderBy(desc(series.createdAt)),
    ]);

    const movieCards: MovieCardData[] = movieRows.map((movie) => ({
      tmdbId: movie.tmdbId,
      releaseYear: getYear(movie.releaseDate),
      posterImage: getPoster(movie.posterPath),
      rating: (movie.voteAverage ?? 0) / 10,
      episodeInfo: "Movie",
      title: movie.title,
      completion: getCompletion(movie.watchStatus),
      type: "Movie",
    }));

    const seriesCards: MovieCardData[] = seriesRows.map((show) => ({
      tmdbId: show.tmdbId,
      releaseYear: getYear(show.firstAirDate),
      posterImage: getPoster(show.posterPath),
      rating: (show.voteAverage ?? 0) / 10,
      episodeInfo: show.totalNumberOfEpisodes
        ? `EP ${show.totalNumberOfEpisodesWatched ?? 0} OF ${show.totalNumberOfEpisodes}`
        : "Series",
      title: show.name,
      completion: getCompletion(
        show.watchStatus,
        show.totalNumberOfEpisodesWatched ?? 0,
        show.totalNumberOfEpisodes,
      ),
      type: "Series",
    }));

    return NextResponse.json({ movies: movieCards, series: seriesCards });
  } catch (error) {
    console.error("Failed to load library:", error);
    return NextResponse.json(
      { error: "Failed to load library" },
      { status: 500 },
    );
  }
}
