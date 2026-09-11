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
  const isPending = useAppSelector(
    (state) => state.library.pending[libraryItemKey(mediaType, tmdbId)] !== undefined,
  );

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

  return { isPending, requestMutation };
}
