import type { MovieCardData } from "@/components/custom/movie-card";
import { WATCH_STATUS } from "@/lib/constants";
import { getYearNumber, posterUrl } from "@/lib/media/display";
import { listUserMovies, listUserSeries } from "@/repositories/library";

const FALLBACK_POSTER = "/file.svg";

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

export async function getLibrary(userId: number) {
  const [movieRows, seriesRows] = await Promise.all([
    listUserMovies(userId),
    listUserSeries(userId),
  ]);

  const movieCards: MovieCardData[] = movieRows.map((movie) => ({
    tmdbId: movie.tmdbId,
    releaseYear: getYearNumber(movie.releaseDate),
    posterImage: posterUrl(movie.posterPath, FALLBACK_POSTER),
    rating: movie.voteAverage ?? 0,
    episodeInfo: "Movie",
    title: movie.title,
    completion: getCompletion(movie.watchStatus),
    type: "Movie",
    watchStatus: movie.watchStatus,
  }));

  const seriesCards: MovieCardData[] = seriesRows.map((show) => ({
    tmdbId: show.tmdbId,
    releaseYear: getYearNumber(show.firstAirDate),
    posterImage: posterUrl(show.posterPath, FALLBACK_POSTER),
    rating: show.voteAverage ?? 0,
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
    watchStatus: show.watchStatus,
  }));

  return { movies: movieCards, series: seriesCards };
}
