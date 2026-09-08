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
};

export type ContentMutation =
  | "add-watchlist"
  | "remove-watchlist"
  | "update-impression";

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
      }>,
    ) => {
      const entry = state[action.payload.mediaType][action.payload.id];
      if (!entry) return;
      entry.mutationStatus = "loading";
      entry.mutationError = undefined;
      entry.lastMutation = action.payload.mutation;
    },
    mutationSucceeded: (
      state,
      action: PayloadAction<{
        id: string;
        mediaType: ContentMediaType;
        data: Partial<ContentDetailsData>;
      }>,
    ) => {
      const entry = state[action.payload.mediaType][action.payload.id];
      if (!entry) return;
      entry.mutationStatus = "success";
      entry.mutationError = undefined;
      if (entry.data) Object.assign(entry.data, action.payload.data);
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
