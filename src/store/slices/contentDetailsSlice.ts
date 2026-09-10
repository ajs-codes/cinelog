import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MovieDetails, SeriesDetails } from "@/lib/types";

export type ContentMediaType = "movie" | "series";
export type ContentDetailsData = MovieDetails | SeriesDetails;
export type ContentDetailsStatus = "loading" | "success" | "failed";
export type ContentMutationStatus = ContentDetailsStatus | "idle";

export type ContentDetailsEntry = {
  data: ContentDetailsData | null;
  error?: string;
  status: ContentDetailsStatus;
  mutationStatus?: ContentMutationStatus;
  mutationError?: string;
  lastMutation?: ContentMutation;
  pendingValue?: number | null;
  pendingProgress?: ContentProgressMutation;
};

export type ContentMutation =
  | "add-watchlist"
  | "update-impression"
  | "update-watch-status"
  | "update-progress";

export type ContentProgressMutation = {
  seasonNumber: number;
  episodeNumber: number;
};

export type ContentLibraryFields = {
  is_present_in_watchlist?: boolean;
  watch_status?: number | null;
  impression?: number | null;
  total_number_of_episodes_watched?: number;
  total_number_of_seasons_watched?: number;
  seasons?: Array<{
    season_number: number;
    episode_count?: number;
    episodes_watched: number;
  }>;
};

export type ContentDetailsState = Record<
  ContentMediaType,
  Record<string, ContentDetailsEntry>
>;

const initialState: ContentDetailsState = {
  movie: {},
  series: {},
};

const contentDetailsSlice = createSlice({
  name: "contentDetails",
  initialState,
  reducers: {
    detailsRequested: (
      state,
      action: PayloadAction<{ id: string; mediaType: ContentMediaType }>,
    ) => {
      state[action.payload.mediaType][action.payload.id] = {
        data: null,
        error: undefined,
        status: "loading",
        mutationStatus: "idle",
      };
    },
    detailsSucceeded: (
      state,
      action: PayloadAction<{
        data: ContentDetailsData;
        id: string;
        mediaType: ContentMediaType;
      }>,
    ) => {
      state[action.payload.mediaType][action.payload.id] = {
        data: action.payload.data,
        error: undefined,
        status: "success",
        mutationStatus: "idle",
      };
    },
    detailsFailed: (
      state,
      action: PayloadAction<{
        error: string;
        id: string;
        mediaType: ContentMediaType;
      }>,
    ) => {
      state[action.payload.mediaType][action.payload.id] = {
        data: null,
        error: action.payload.error,
        status: "failed",
        mutationStatus: "idle",
      };
    },
    mutationRequested: (
      state,
      action: PayloadAction<{
        id: string;
        mediaType: ContentMediaType;
        mutation: ContentMutation;
        value?: number | null;
        content?: ContentDetailsData;
        progress?: ContentProgressMutation;
      }>,
    ) => {
      const entry = state[action.payload.mediaType][action.payload.id];
      if (!entry) return;
      entry.mutationStatus = "loading";
      entry.mutationError = undefined;
      entry.lastMutation = action.payload.mutation;
      entry.pendingValue = action.payload.value;
      entry.pendingProgress = action.payload.progress;
    },
    mutationSucceeded: (
      state,
      action: PayloadAction<{
        id: string;
        mediaType: ContentMediaType;
        data: ContentLibraryFields;
      }>,
    ) => {
      const entry = state[action.payload.mediaType][action.payload.id];
      if (!entry) return;
      entry.mutationStatus = "success";
      entry.mutationError = undefined;
      entry.pendingValue = undefined;
      entry.pendingProgress = undefined;
      if (!entry.data) return;

      const { seasons, ...libraryFields } = action.payload.data;
      Object.assign(entry.data, libraryFields);

      if (seasons && "seasons" in entry.data && Array.isArray(entry.data.seasons)) {
        const progressByNumber = new Map(
          seasons.map((season) => [season.season_number, season.episodes_watched]),
        );
        entry.data.seasons = entry.data.seasons.map((season) => ({
          ...season,
          episodes_watched:
            season.season_number === undefined
              ? season.episodes_watched
              : (progressByNumber.get(season.season_number) ??
                season.episodes_watched),
        }));
      }
    },
    mutationFailed: (
      state,
      action: PayloadAction<{
        id: string;
        mediaType: ContentMediaType;
        error: string;
      }>,
    ) => {
      const entry = state[action.payload.mediaType][action.payload.id];
      if (!entry) return;
      entry.mutationStatus = "failed";
      entry.mutationError = action.payload.error;
      entry.pendingValue = undefined;
      entry.pendingProgress = undefined;
    },
  },
});

export const {
  detailsFailed,
  detailsRequested,
  detailsSucceeded,
  mutationFailed,
  mutationRequested,
  mutationSucceeded,
} = contentDetailsSlice.actions;
export default contentDetailsSlice.reducer;
