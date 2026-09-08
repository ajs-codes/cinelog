import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { MovieCardData } from "@/components/custom/movie-card";

export type LibraryStatus = "idle" | "loading" | "succeeded" | "failed";

export type LibraryState = {
  movies: MovieCardData[];
  series: MovieCardData[];
  status: LibraryStatus;
  error: string | null;
};

const initialState: LibraryState = {
  movies: [],
  series: [],
  status: "idle",
  error: null,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    libraryRequested: (state) => {
      state.status = "loading";
      state.error = null;
    },
    librarySucceeded: (
      state,
      action: PayloadAction<{
        movies: MovieCardData[];
        series: MovieCardData[];
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
  },
});

export const { libraryFailed, libraryRequested, librarySucceeded } =
  librarySlice.actions;
export default librarySlice.reducer;
