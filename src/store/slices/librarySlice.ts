import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { LibraryMovie, LibrarySeries } from "@/lib/types";

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

type LibraryItemSnapshot = {
  watch_status: number;
  impression: number | null;
};

export type LibraryState = {
  movies: LibraryMovie[];
  series: LibrarySeries[];
  status: LibraryStatus;
  error: string | null;
  /** Pre-mutation values for in-flight items, keyed by `libraryItemKey`. */
  pending: Record<string, LibraryItemSnapshot>;
};

const initialState: LibraryState = {
  movies: [],
  series: [],
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

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    libraryRequested: (state) => {
      if (state.status !== "succeeded") {
        state.status = "loading";
      }
      state.error = null;
    },
    librarySucceeded: (
      state,
      action: PayloadAction<{
        movies: LibraryMovie[];
        series: LibrarySeries[];
      }>,
    ) => {
      state.movies = action.payload.movies;
      state.series = action.payload.series;
      state.status = "succeeded";
      state.error = null;
    },
    libraryFailed: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
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
      action: PayloadAction<{ tmdbId: number; mediaType: LibraryMediaType }>,
    ) => {
      const { mediaType, tmdbId } = action.payload;
      delete state.pending[libraryItemKey(mediaType, tmdbId)];
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
  libraryRequested,
  librarySucceeded,
} = librarySlice.actions;
export default librarySlice.reducer;
