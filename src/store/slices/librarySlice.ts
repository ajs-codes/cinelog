import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  LibraryMetadata,
  LibraryMovie,
  LibrarySeries,
  LibrarySeriesSeason,
} from "@/lib/types";

export type LibraryStatus = "idle" | "loading" | "succeeded" | "failed";

export type LibraryMediaType = "movie" | "series";

export type LibraryItemMutation = {
  tmdbId: number;
  mediaType: LibraryMediaType;
  watch_status?: number;
  impression?: number | null;
  progress?: {
    seasonNumber: number;
    episodeNumber: number;
  };
};

export type SeriesProgressFields = {
  watch_status: number | null;
  impression: number | null;
  total_number_of_episodes_watched: number;
  total_number_of_seasons_watched: number;
  seasons: Array<{
    season_number: number;
    episode_count: number;
    episodes_watched: number;
  }>;
};

type LibraryItemSnapshot = {
  watch_status: number;
  impression: number | null;
};

export type LibraryState = {
  movies: LibraryMovie[];
  series: LibrarySeries[];
  movieCount: number;
  seriesCount: number;
  moviesHasMore: boolean;
  seriesHasMore: boolean;
  moviesLoaded: boolean;
  seriesLoaded: boolean;
  moviesLoadingMore: boolean;
  seriesLoadingMore: boolean;
  status: LibraryStatus;
  error: string | null;
  /** Pre-mutation values for in-flight items, keyed by `libraryItemKey`. */
  pending: Record<string, LibraryItemSnapshot>;
};

const initialState: LibraryState = {
  movies: [],
  series: [],
  movieCount: 0,
  seriesCount: 0,
  moviesHasMore: false,
  seriesHasMore: false,
  moviesLoaded: false,
  seriesLoaded: false,
  moviesLoadingMore: false,
  seriesLoadingMore: false,
  status: "idle",
  error: null,
  pending: {},
};

export function libraryItemKey(mediaType: LibraryMediaType, tmdbId: number) {
  return `${mediaType}-${tmdbId}`;
}

function findItem(
  state: LibraryState,
  mediaType: LibraryMediaType,
  tmdbId: number,
) {
  return mediaType === "movie"
    ? state.movies.find((movie) => movie.tmdb_id === tmdbId)
    : state.series.find((show) => show.tmdb_id === tmdbId);
}

function appendUnique<T extends { tmdb_id: number }>(
  existing: T[],
  incoming: T[],
) {
  const seen = new Set(existing.map((item) => item.tmdb_id));
  const next = incoming.filter((item) => !seen.has(item.tmdb_id));
  return next.length === 0 ? existing : [...existing, ...next];
}

function applyCounts(state: LibraryState, metadata: LibraryMetadata) {
  state.movieCount = metadata.count.movies;
  state.seriesCount = metadata.count.series;
}

function applySeriesProgress(
  item: LibrarySeries,
  update: SeriesProgressFields,
) {
  if (update.watch_status !== null) {
    item.watch_status = update.watch_status;
  }
  item.impression = update.impression;
  item.total_number_of_episodes_watched =
    update.total_number_of_episodes_watched;
  item.total_number_of_seasons_watched = update.total_number_of_seasons_watched;

  const airDateBySeason = new Map(
    item.seasons_info.map((season) => [season.season_number, season.air_date]),
  );

  item.seasons_info = update.seasons.map(
    (season): LibrarySeriesSeason => ({
      season_number: season.season_number,
      episode_count: season.episode_count,
      episodes_watched: season.episodes_watched,
      air_date: airDateBySeason.get(season.season_number) ?? null,
    }),
  );
}

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    libraryRequested: (
      state,
      action: PayloadAction<{ type: LibraryMediaType }>,
    ) => {
      const loaded =
        action.payload.type === "movie"
          ? state.moviesLoaded
          : state.seriesLoaded;
      if (loaded) return;

      if (state.status !== "succeeded") {
        state.status = "loading";
      }
      state.error = null;
    },
    librarySucceeded: (
      state,
      action: PayloadAction<{
        type: LibraryMediaType;
        movies: LibraryMovie[];
        series: LibrarySeries[];
        metadata: LibraryMetadata;
      }>,
    ) => {
      const { type, movies, series, metadata } = action.payload;
      applyCounts(state, metadata);

      if (type === "movie") {
        state.movies = movies;
        state.moviesHasMore = metadata.hasMore;
        state.moviesLoaded = true;
        state.moviesLoadingMore = false;
      } else {
        state.series = series;
        state.seriesHasMore = metadata.hasMore;
        state.seriesLoaded = true;
        state.seriesLoadingMore = false;
      }

      state.status = "succeeded";
      state.error = null;
    },
    libraryFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
      state.moviesLoadingMore = false;
      state.seriesLoadingMore = false;
    },
    libraryPageRequested: (
      state,
      action: PayloadAction<{ type: LibraryMediaType }>,
    ) => {
      if (action.payload.type === "movie") {
        if (!state.moviesHasMore || state.moviesLoadingMore) return;
        state.moviesLoadingMore = true;
      } else {
        if (!state.seriesHasMore || state.seriesLoadingMore) return;
        state.seriesLoadingMore = true;
      }
      state.error = null;
    },
    libraryPageSucceeded: (
      state,
      action: PayloadAction<{
        type: LibraryMediaType;
        movies: LibraryMovie[];
        series: LibrarySeries[];
        metadata: LibraryMetadata;
      }>,
    ) => {
      const { type, movies, series, metadata } = action.payload;
      applyCounts(state, metadata);

      if (type === "movie") {
        state.movies = appendUnique(state.movies, movies);
        state.moviesHasMore = metadata.hasMore;
        state.moviesLoadingMore = false;
      } else {
        state.series = appendUnique(state.series, series);
        state.seriesHasMore = metadata.hasMore;
        state.seriesLoadingMore = false;
      }
    },
    libraryPageFailed: (
      state,
      action: PayloadAction<{ type: LibraryMediaType; error: string }>,
    ) => {
      if (action.payload.type === "movie") {
        state.moviesLoadingMore = false;
      } else {
        state.seriesLoadingMore = false;
      }
      state.error = action.payload.error;
    },
    libraryItemMutationRequested: (
      state,
      action: PayloadAction<LibraryItemMutation>,
    ) => {
      const { mediaType, tmdbId, watch_status, impression } = action.payload;
      const item = findItem(state, mediaType, tmdbId);
      if (!item) return;

      const key = libraryItemKey(mediaType, tmdbId);
      state.pending[key] ??= {
        watch_status: item.watch_status,
        impression: item.impression,
      };

      if (watch_status !== undefined) {
        item.watch_status = watch_status;
      }
      if (impression !== undefined) {
        item.impression = impression;
      }
    },
    libraryItemMutationSucceeded: (
      state,
      action: PayloadAction<{
        tmdbId: number;
        mediaType: LibraryMediaType;
        seriesUpdate?: SeriesProgressFields;
      }>,
    ) => {
      const { mediaType, tmdbId, seriesUpdate } = action.payload;
      delete state.pending[libraryItemKey(mediaType, tmdbId)];

      if (mediaType === "series" && seriesUpdate) {
        const item = state.series.find((show) => show.tmdb_id === tmdbId);
        if (item) {
          applySeriesProgress(item, seriesUpdate);
        }
      }
    },
    libraryItemMutationFailed: (
      state,
      action: PayloadAction<{
        tmdbId: number;
        mediaType: LibraryMediaType;
        error: string;
      }>,
    ) => {
      const { mediaType, tmdbId, error } = action.payload;
      const key = libraryItemKey(mediaType, tmdbId);
      const snapshot = state.pending[key];
      const item = findItem(state, mediaType, tmdbId);

      if (item && snapshot) {
        item.watch_status = snapshot.watch_status;
        item.impression = snapshot.impression;
      }

      delete state.pending[key];
      state.error = error;
    },
  },
});

export const {
  libraryFailed,
  libraryItemMutationFailed,
  libraryItemMutationRequested,
  libraryItemMutationSucceeded,
  libraryPageFailed,
  libraryPageRequested,
  libraryPageSucceeded,
  libraryRequested,
  librarySucceeded,
} = librarySlice.actions;
export default librarySlice.reducer;
