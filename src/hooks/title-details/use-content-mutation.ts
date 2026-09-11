"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store";
import {
  canUpdateMovieWatchActivity,
  canUpdateSeriesWatchActivity,
} from "@/lib/media/status";
import type { MovieDetails, SeriesDetails } from "@/lib/types";
import {
  mutationRequested,
  type ContentMediaType,
  type ContentMutation,
  type ContentMutationStatus,
  type ContentProgressMutation,
} from "@/store/slices/contentDetailsSlice";

type UseContentMutationOptions = {
  id?: number;
  mediaType?: ContentMediaType;
  mutationStatus?: ContentMutationStatus;
  isPresentInWatchlist?: boolean;
  content?: MovieDetails | SeriesDetails;
};

export function useContentMutation({
  id,
  mediaType,
  mutationStatus = "idle",
  isPresentInWatchlist = false,
  content,
}: UseContentMutationOptions) {
  const dispatch = useAppDispatch();
  const isPendingRef = useRef(false);
  const isMutating = mutationStatus === "loading";

  useEffect(() => {
    if (mutationStatus !== "loading") {
      isPendingRef.current = false;
    }
  }, [mutationStatus]);

  const canUpdateWatchActivity =
    mediaType === "movie"
      ? canUpdateMovieWatchActivity(content?.status)
      : mediaType === "series"
        ? canUpdateSeriesWatchActivity(content?.status)
        : false;

  const requestMutation = useCallback(
    (
      mutation: ContentMutation,
      options?: {
        value?: number | null;
        progress?: ContentProgressMutation;
        requireWatchlist?: boolean;
        requireWatchActivity?: boolean;
      },
    ) => {
      const requireWatchlist = options?.requireWatchlist ?? mutation !== "add-watchlist";
      const requireWatchActivity =
        options?.requireWatchActivity ?? mutation !== "add-watchlist";

      if (id === undefined || !mediaType || isMutating || isPendingRef.current) {
        return;
      }
      if (requireWatchlist && !isPresentInWatchlist) return;
      if (requireWatchActivity && !canUpdateWatchActivity) return;

      isPendingRef.current = true;
      dispatch(
        mutationRequested({
          id: String(id),
          mediaType,
          mutation,
          value: options?.value,
          content,
          progress: options?.progress,
        }),
      );
    },
    [
      canUpdateWatchActivity,
      content,
      dispatch,
      id,
      isMutating,
      isPresentInWatchlist,
      mediaType,
    ],
  );

  return {
    requestMutation,
    isMutating,
    canUpdateWatchActivity,
  };
}
