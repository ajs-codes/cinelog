"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchShortcut } from "@/hooks/search-popup/use-search-shortcut";
import type { SearchMediaType } from "@/components/search-popup/search-controls";
import type { BadgeIndicator } from "@/lib/types";
import { searchCleared, searchRequested } from "@/store/slices/searchSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export function useSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<SearchMediaType>("movie");
  const [year, setYear] = useState<number>();
  const [region, setRegion] = useState<string>();
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state.search[mediaType]);

  const requestSearch = useCallback(
    (nextPage: number, nextQuery = query.trim()) => {
      dispatch(
        searchRequested({
          mediaType,
          query: nextQuery,
          year,
          region: mediaType === "movie" ? region : undefined,
          page: nextPage,
        }),
      );
    },
    [dispatch, mediaType, query, region, year],
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setYear(undefined);
      setRegion(undefined);
      setPage(1);
    }
  }, []);

  const handleMediaTypeChange = useCallback((nextType: SearchMediaType) => {
    setMediaType(nextType);
    setPage(1);
    if (nextType === "series") {
      setRegion(undefined);
    }
  }, []);

  const handleQueryChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  }, []);

  const handleYearChange = useCallback((nextYear?: number) => {
    setYear(nextYear);
    setPage(1);
  }, []);

  const handleRegionChange = useCallback((nextRegion?: string) => {
    setRegion(nextRegion);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      requestSearch(nextPage);
    },
    [requestSearch],
  );

  useSearchShortcut(
    useCallback(() => handleOpenChange(!open), [handleOpenChange, open]),
  );

  const resultIndicator: BadgeIndicator | undefined =
    searchState.status === "loading"
      ? "accentAlt"
      : searchState.status === "failed"
        ? "error"
        : searchState.status === "idle"
          ? undefined
          : "success";
  const resultText =
    searchState.status === "idle"
      ? `Search for ${mediaType === "movie" ? "movies" : "series"}`
      : `${searchState.total_results} results`;
  const showPagination =
    searchState.total_pages > 1 &&
    (searchState.status === "success" || searchState.status === "loading");

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length <= 0) {
      dispatch(searchCleared(mediaType));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(
        searchRequested({
          mediaType,
          query: normalizedQuery,
          year,
          region: mediaType === "movie" ? region : undefined,
          page: 1,
        }),
      );
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, mediaType, query, region, year]);

  return {
    open,
    query,
    mediaType,
    year,
    region,
    page,
    searchState,
    resultIndicator,
    resultText,
    showPagination,
    requestSearch,
    handleOpenChange,
    handleMediaTypeChange,
    handleQueryChange,
    handleYearChange,
    handleRegionChange,
    handlePageChange,
  };
}
