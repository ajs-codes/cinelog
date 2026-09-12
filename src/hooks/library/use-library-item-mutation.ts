"use client";

import type { LibraryMediaType } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  libraryItemKey,
  libraryItemMutationRequested,
  type LibraryItemMutation,
} from "@/store/slices/librarySlice";

export function useLibraryItemMutation(
  mediaType: LibraryMediaType,
  tmdbId: number,
) {
  const dispatch = useAppDispatch();
  const pendingSnapshot = useAppSelector(
    (state) => state.library.pending[libraryItemKey(mediaType, tmdbId)],
  );
  const isPending = pendingSnapshot !== undefined;
  const isImpressionPending = pendingSnapshot?.pendingType === "impression";
  const isStatusPending = pendingSnapshot?.pendingType === "watch_status";
  const isProgressPending = pendingSnapshot?.pendingType === "progress";

  function requestMutation(
    payload: Omit<LibraryItemMutation, "mediaType" | "tmdbId">,
  ) {
    dispatch(
      libraryItemMutationRequested({
        mediaType,
        tmdbId,
        ...payload,
      }),
    );
  }

  return {
    isPending,
    isImpressionPending,
    isStatusPending,
    isProgressPending,
    requestMutation,
  };
}
