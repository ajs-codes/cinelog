import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MovieDetails, SeriesDetails } from "@/lib/types";

export type ContentMediaType = "movie" | "series";
export type ContentDetailsData = MovieDetails | SeriesDetails;
export type ContentDetailsStatus = "loading" | "success" | "failed";

export type ContentDetailsEntry = {
  data: ContentDetailsData | null;
  error?: string;
  status: ContentDetailsStatus;
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
      };
    },
  },
});

export const { detailsFailed, detailsRequested, detailsSucceeded } =
  contentDetailsSlice.actions;
export default contentDetailsSlice.reducer;
