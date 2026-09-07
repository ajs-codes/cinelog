import { z } from "zod";
import { TMDB_POSTER_BASE_URL } from "@/lib/constants";

const searchQuerySchema = z.object({
  query: z.string().trim().min(1).max(100),
});

type SearchType = "movie" | "tv";

type TmdbResult = {
  genre_ids?: number[];
  id?: number;
  original_language?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  vote_average?: number;
};

type TmdbSearchResponse = {
  results?: TmdbResult[];
};

function getYear(date: string | undefined) {
  return date?.slice(0, 4) ?? "";
}

export async function searchTmdb(request: Request, type: SearchType) {
  const query = new URL(request.url).searchParams.get("query");
  const parsedQuery = searchQuerySchema.safeParse({ query });

  if (!parsedQuery.success) {
    return Response.json(
      { error: "The query parameter must be a non-empty string" },
      { status: 400 },
    );
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "TMDB API key is not configured" },
      { status: 503 },
    );
  }

  const endpoint = type === "movie" ? "movie" : "tv";
  const params = new URLSearchParams({
    query: parsedQuery.data.query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${endpoint}?${params.toString()}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "TMDB search request failed" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as TmdbSearchResponse;

    return Response.json({
      results: (data.results ?? []).map((result) => ({
        genre_ids: result.genre_ids ?? [],
        id: result.id,
        original_language: result.original_language,
        overview: result.overview,
        poster_path: result.poster_path
          ? `${TMDB_POSTER_BASE_URL}${result.poster_path}`
          : null,
        release_date: getYear(result.release_date ?? result.first_air_date),
        title: result.title ?? result.name,
        vote_average: result.vote_average,
      })),
    });
  } catch {
    return Response.json(
      { error: "TMDB search request failed" },
      { status: 502 },
    );
  }
}
