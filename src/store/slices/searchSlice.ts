import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SearchMediaType = "movie" | "series";
export type SearchStatus = "idle" | "loading" | "success" | "failed";

export type SearchResult = {
  genres: string[];
  id?: number;
  original_language?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  title?: string;
  vote_average?: number;
};

type SearchMediaState = {
  error?: string;
  query: string;
  results: SearchResult[];
  status: SearchStatus;
};

export type SearchState = Record<SearchMediaType, SearchMediaState>;

const initialMediaState: SearchMediaState = {
  query: "",
  results: [],
  status: "idle",
};

const initialState: SearchState = {
  movie: initialMediaState,
  series: initialMediaState,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    searchRequested: (
      state,
      action: PayloadAction<{ mediaType: SearchMediaType; query: string }>,
    ) => {
      const mediaState = state[action.payload.mediaType];
      mediaState.error = undefined;
      mediaState.query = action.payload.query;
      mediaState.results = [];
      mediaState.status = "loading";
    },
    searchSucceeded: (
      state,
      action: PayloadAction<{
        mediaType: SearchMediaType;
        query: string;
        results: SearchResult[];
      }>,
    ) => {
      const mediaState = state[action.payload.mediaType];
      mediaState.error = undefined;
      mediaState.query = action.payload.query;
      mediaState.results = action.payload.results;
      mediaState.status = "success";
    },
    searchFailed: (
      state,
      action: PayloadAction<{
        error: string;
        mediaType: SearchMediaType;
        query: string;
      }>,
    ) => {
      const mediaState = state[action.payload.mediaType];
      mediaState.error = action.payload.error;
      mediaState.query = action.payload.query;
      mediaState.results = [];
      mediaState.status = "failed";
    },
    searchCleared: (state, action: PayloadAction<SearchMediaType>) => {
      state[action.payload] = { ...initialMediaState };
    },
  },
});

export const { searchCleared, searchFailed, searchRequested, searchSucceeded } =
  searchSlice.actions;
export default searchSlice.reducer;
