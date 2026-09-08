import type { MovieDetails, SeriesDetails } from "@/lib/types";

type MetaRowInput = {
  movie?: MovieDetails | null;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

type MetaRowData = {
  contentType: string;
  duration: string;
  rating: string;
  status: string;
  year: string;
};

export function useMetaRow({ movie, series, type }: MetaRowInput): MetaRowData {
  const firstAirYear = series?.first_air_date?.slice(0, 4) ?? "N/A";
  const lastAirYear = series?.last_air_date?.slice(0, 4) ?? "Present";
  const year = movie
    ? (movie.release_date?.slice(0, 4) ?? "N/A")
    : firstAirYear === lastAirYear
      ? lastAirYear
      : `${firstAirYear} - ${lastAirYear}`;
  const seasonCount = series?.number_of_seasons ?? 1;
  const episodeCount = series?.number_of_episodes ?? 10;
  const movieRating = movie?.release_dates
    ?.flatMap((release) => release.release_dates ?? [])
    .find((release) => release.certification)?.certification;

  return {
    contentType: type === "series" ? "Series" : "Movie",
    duration: movie
      ? movie.runtime
        ? `${movie.runtime} min`
        : "N/A"
      : `${seasonCount} ${seasonCount === 1 ? "Season" : "Seasons"} (${episodeCount} ${episodeCount === 1 ? "Episode" : "Episodes"})`,
    rating: movieRating ?? series?.content_ratings?.rating ?? "N/A",
    status: movie?.status ?? series?.status ?? "N/A",
    year,
  };
}
