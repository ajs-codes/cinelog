import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TmdbCastMember = {
  order?: number;
  [key: string]: unknown;
};

type TmdbCrewMember = {
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbMovie = {
  backdrop_path?: string | null;
  belongs_to_collection?: unknown;
  genres?: unknown[] | null;
  id?: number;
  imdb_id?: string | null;
  overview?: string;
  poster_path?: string | null;
  production_companies?: unknown[] | null;
  release_date?: string;
  runtime?: number | null;
  status?: string;
  tagline?: string | null;
  title?: string;
  vote_average?: number;
  original_language?: string | null;
  origin_country?: string[] | null;
  release_dates?: {
    results?: Array<{ iso_3166_1?: string; [key: string]: unknown }>;
  };
  credits?: {
    cast?: TmdbCastMember[];
    crew?: TmdbCrewMember[];
  };
};

function getMovieFields(movie: TmdbMovie) {
  const cast = [...(movie.credits?.cast ?? [])]
    .sort(
      (first, second) => (first.order ?? Infinity) - (second.order ?? Infinity),
    )
    .slice(0, 10);
  const directingCrew: TmdbCrewMember[] = [];
  for (const member of movie.credits?.crew ?? []) {
    if (member.known_for_department !== "Directing") continue;

    directingCrew.push(member);
    if (directingCrew.length === 5) break;
  }

  return {
    backdrop_path: movie.backdrop_path,
    belongs_to_collection: movie.belongs_to_collection,
    genres: movie.genres ?? [],
    id: movie.id,
    imdb_id: movie.imdb_id,
    overview: movie.overview,
    poster_path: movie.poster_path,
    production_companies: movie.production_companies ?? [],
    release_date: movie.release_date,
    runtime: movie.runtime,
    status: movie.status,
    tagline: movie.tagline,
    title: movie.title,
    vote_average: movie.vote_average,
    original_language: movie.original_language,
    origin_country: movie.origin_country,
    release_dates: (movie.release_dates?.results ?? []).filter(
      (release) => release.iso_3166_1 === "IN",
    ),
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
