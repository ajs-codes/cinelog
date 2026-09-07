import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db/index";
import { genres } from "../src/db/schema";

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbGenreResponse = {
  genres?: TmdbGenre[];
};

type GenreType = 0 | 1;

config({ path: [".env.local", ".env"] });

const tmdbApiKey = process.env.TMDB_API_KEY;

if (!tmdbApiKey) {
  throw new Error("TMDB_API_KEY is not configured");
}

async function fetchGenres(endpoint: "movie" | "tv", type: GenreType) {
  const response = await fetch(
    `https://api.themoviedb.org/3/genre/${endpoint}/list?language=en`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${tmdbApiKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `TMDB ${endpoint} genre request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as TmdbGenreResponse;
  return (data.genres ?? []).map((genre) => ({
    tmdbId: genre.id,
    type,
    name: genre.name,
  }));
}

async function seed() {
  const [movieGenres, seriesGenres] = await Promise.all([
    fetchGenres("movie", 0),
    fetchGenres("tv", 1),
  ]);
  const db = getDb();
  const allGenres = [...movieGenres, ...seriesGenres];

  for (const genre of allGenres) {
    await db
      .insert(genres)
      .values(genre)
      .onConflictDoUpdate({
        target: genres.tmdbId,
        set: {
          name: genre.name,
          type: genre.type
        },
      });
  }

  const [movieCount, seriesCount] = await Promise.all([
    db.$count(genres, eq(genres.type, 0)),
    db.$count(genres, eq(genres.type, 1)),
  ]);

  console.log(
    `Seeded ${movieGenres.length} movie genres and ${seriesGenres.length} series genres (${movieCount} movies, ${seriesCount} series total).`,
  );
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
