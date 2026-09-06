import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Movie } from "@/db/schema";
import type { MovieInput } from "@/lib/validation/movie";

type MovieState = {
  items: Movie[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: MovieState = {
  items: [],
  status: "idle",
  error: null,
};

const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    fetchMoviesRequested(state) {
      state.status = "loading";
      state.error = null;
    },
    fetchMoviesSucceeded(state, action: PayloadAction<Movie[]>) {
      state.items = action.payload;
      state.status = "succeeded";
    },
    fetchMoviesFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
    addMovieRequested: {
      reducer(state) {
        state.error = null;
      },
      prepare(payload: MovieInput) {
        return { payload };
      },
    },
  },
});

export const {
  addMovieRequested,
  fetchMoviesFailed,
  fetchMoviesRequested,
  fetchMoviesSucceeded,
} = movieSlice.actions;

export default movieSlice.reducer;
