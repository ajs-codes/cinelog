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

type TmdbContentRating = {
  iso_3166_1?: string;
  [key: string]: unknown;
};

type TmdbSeries = {
  backdrop_path?: string | null;
  created_by?: unknown[] | null;
  first_air_date?: string;
  genres?: unknown[] | null;
  id?: number;
  last_air_date?: string;
  name?: string;
  networks?: unknown[] | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  overview?: string;
  poster_path?: string | null;
  production_companies?: unknown[] | null;
  production_countries?: unknown[] | null;
  seasons?: unknown[] | null;
  spoken_languages?: unknown[] | null;
  status?: string;
  tagline?: string | null;
  type?: string;
  vote_average?: number;
  content_ratings?: {
    results?: TmdbContentRating[];
  };
  imdb_id?: string | null;
  external_ids?: {
    imdb_id?: string | null;
  };
  credits?: {
    cast?: TmdbCastMember[];
    crew?: TmdbCrewMember[];
  };
};

function getSeriesFields(series: TmdbSeries) {
  const cast = [...(series.credits?.cast ?? [])]
    .sort(
      (first, second) => (first.order ?? Infinity) - (second.order ?? Infinity),
    )
    .slice(0, 10);
  const directingCrew: TmdbCrewMember[] = [];

  for (const member of series.credits?.crew ?? []) {
    if (member.known_for_department !== "Directing") continue;

    directingCrew.push(member);
    if (directingCrew.length === 5) break;
  }

  return {
    backdrop_path: series.backdrop_path,
    created_by: series.created_by ?? [],
    first_air_date: series.first_air_date,
    genres: series.genres ?? [],
    id: series.id,
    last_air_date: series.last_air_date,
    name: series.name,
    networks: series.networks ?? [],
    number_of_episodes: series.number_of_episodes,
    number_of_seasons: series.number_of_seasons,
    overview: series.overview,
    poster_path: series.poster_path,
    production_companies: series.production_companies ?? [],
    production_countries: series.production_countries ?? [],
    seasons: series.seasons ?? [],
    spoken_languages: series.spoken_languages ?? [],
    status: series.status,
    tagline: series.tagline,
    type: series.type,
    vote_average: series.vote_average,
    imdb_id: series.imdb_id ?? series.external_ids?.imdb_id,
    content_ratings:
      series.content_ratings?.results?.find(
        (rating) => rating.iso_3166_1 === "IN",
      ) ?? {},
    credits: [...cast, ...directingCrew],
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const seriesId = Number(id);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    return NextResponse.json({ error: "Invalid series ID" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 503 },
    );
  }

  const queryParams = new URLSearchParams({
    append_to_response: "external_ids,content_ratings,credits",
    language: "en-US",
  });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}?${queryParams.toString()}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDB series request failed" },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const series = (await response.json()) as TmdbSeries;
    return NextResponse.json(getSeriesFields(series));
  } catch {
    return NextResponse.json(
      { error: "TMDB series request failed" },
      { status: 502 },
    );
  }
}
