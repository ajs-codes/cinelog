"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  detailsRequested,
  type ContentMediaType,
} from "@/store/slices/contentDetailsSlice";

type ContentDetailsState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  retry: () => void;
};

export function useContentDetails<T>(
  mediaType: ContentMediaType,
  id: string,
): ContentDetailsState<T> {
  const dispatch = useAppDispatch();
  const entry = useAppSelector((state) => state.contentDetails[mediaType][id]);
  const requestedKey = useRef<string | null>(null);

  const retry = () => {
    dispatch(detailsRequested({ id, mediaType }));
  };

  useEffect(() => {
    const requestKey = `${mediaType}:${id}`;

    if (entry || requestedKey.current === requestKey) return;

    requestedKey.current = requestKey;
    dispatch(detailsRequested({ id, mediaType }));
  }, [dispatch, entry, id, mediaType]);

  return {
    data: (entry?.data as T | null) ?? null,
    error: entry?.error ? new Error(entry.error) : null,
    isLoading: !entry || entry.status === "loading",
    retry,
  };
}
