import { TMDB_POSTER_BASE_URL } from "@/lib/constants";
import { getYearString } from "@/lib/media/display";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { SearchType, TmdbSearchResponse } from "@/lib/types";
import { findSearchLookups } from "@/repositories/search";

type SearchTitlesInput = {
  query: string;
  type: SearchType;
  userId?: number;
  year?: number;
  region?: string;
  page?: number;
};

export async function searchTitles({
  query,
  type,
  userId,
  year,
  region,
  page = 1,
}: SearchTitlesInput) {
  const endpoint = type === "movie" ? "movie" : "tv";
  const params = new URLSearchParams({
    query,
    include_adult: "false",
    language: "en-US",
    page: String(page),
  });

  if (year !== undefined) {
    params.set(type === "movie" ? "year" : "first_air_date_year", String(year));
  }

  if (type === "movie" && region) {
    params.set("region", region);
  }

  const data = await tmdbFetch<TmdbSearchResponse>(`/search/${endpoint}`, {
    searchParams: params,
    failedMessage: "TMDB search request failed",
  });

  const genreIds = [
    ...new Set(
      (data.results ?? []).flatMap((result) => result.genre_ids ?? []),
    ),
  ];
  const tmdbIds = (data.results ?? []).flatMap((result) =>
    result.id === undefined ? [] : [result.id],
  );
  const { genreRows, watchlistedTmdbIds, watchStatusByTmdbId } =
    await findSearchLookups(type, genreIds, tmdbIds, userId);
  const genreNamesByTmdbId = new Map(
    genreRows.map((genre) => [genre.tmdbId, genre.name]),
  );

  return {
    page: data.page ?? page,
    total_pages: data.total_pages ?? 1,
    total_results: data.total_results ?? (data.results ?? []).length,
    results: (data.results ?? []).map((result) => ({
      id: result.id,
      genres: (result.genre_ids ?? []).flatMap((genreId) => {
        const name = genreNamesByTmdbId.get(genreId);
        return name ? [name] : [];
      }),
      original_language: result.original_language,
      overview: result.overview,
      poster_path: result.poster_path
        ? `${TMDB_POSTER_BASE_URL}${result.poster_path}`
        : null,
      release_date: getYearString(result.release_date ?? result.first_air_date),
      title: result.title ?? result.name,
      vote_average: result.vote_average,
      is_present_in_watchlist:
        result.id !== undefined && watchlistedTmdbIds.has(result.id),
      watch_status:
        result.id !== undefined
          ? (watchStatusByTmdbId.get(result.id) ?? null)
          : null,
    })),
  };
}
