import type { LibraryMovie, LibrarySeries } from "@/lib/types";
import {
  listUserMovies,
  listUserSeries,
  listUserSeriesSeasons,
} from "@/repositories/library";

export async function getLibrary(userId: number) {
  const [movieRows, seriesRows, seasonRows] = await Promise.all([
    listUserMovies(userId),
    listUserSeries(userId),
    listUserSeriesSeasons(userId),
  ]);

  const seasonsBySeries = new Map<
    number,
    LibrarySeries["seasons_info"]
  >();
  for (const season of seasonRows) {
    const seasons = seasonsBySeries.get(season.tmdbId) ?? [];
    seasons.push({
      season_number: season.seasonNumber,
      episode_count: season.episodeCount,
      episodes_watched: season.episodesWatched,
      air_date: season.airDate,
    });
    seasonsBySeries.set(season.tmdbId, seasons);
  }

  const movies: LibraryMovie[] = movieRows.map((movie) => ({
    tmdb_id: movie.tmdbId,
    watch_status: movie.watchStatus,
    impression: movie.impression,
    created_at: movie.createdAt,
    updated_at: movie.updatedAt,
    completed_at: movie.completedAt,
    title: movie.title,
    poster_path: movie.posterPath,
    release_date: movie.releaseDate,
    vote_average: movie.voteAverage,
    status: movie.status,
    original_language: movie.originalLanguage,
    origin_country: movie.originCountry,
    certificate: movie.certificate,
    genres: movie.genres,
  }));

  const series: LibrarySeries[] = seriesRows.map((show) => ({
    tmdb_id: show.tmdbId,
    watch_status: show.watchStatus,
    impression: show.impression,
    created_at: show.createdAt,
    updated_at: show.updatedAt,
    last_watched_at: show.lastWatchedAt,
    completed_at: show.completedAt,
    vote_average: show.voteAverage,
    name: show.name,
    first_air_date: show.firstAirDate,
    last_air_date: show.lastAirDate,
    total_number_of_episodes: show.totalNumberOfEpisodes,
    total_number_of_seasons: show.totalNumberOfSeasons,
    total_number_of_seasons_watched: show.totalNumberOfSeasonsWatched,
    total_number_of_episodes_watched: show.totalNumberOfEpisodesWatched,
    poster_path: show.posterPath,
    status: show.status,
    original_language: show.originalLanguage,
    origin_country: show.originCountry,
    certificate: show.certificate,
    genres: show.genres,
    seasons_info: seasonsBySeries.get(show.tmdbId) ?? [],
  }));

  return { movies, series };
}
