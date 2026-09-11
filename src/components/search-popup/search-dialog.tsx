"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ContentErrorState } from "@/components/custom/content-error-state";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MovieLists } from "@/components/search-popup/movie-lists";
import { SearchGroup } from "@/components/custom/search-group";
import { FloatingSearchButton } from "@/components/search-popup/floating-search-button";
import {
  SearchControls,
  type SearchMediaType,
} from "@/components/search-popup/search-controls";
import { SearchPagination } from "@/components/search-popup/search-pagination";
import { useSearchShortcut } from "@/hooks/search-popup/use-search-shortcut";
import { searchCleared, searchRequested } from "@/store/slices/searchSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export function SearchDialog() {
  const pathname = usePathname();

  return <SearchDialogContent key={pathname} />;
}

function SearchDialogContent() {
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

  useSearchShortcut(
    useCallback(() => handleOpenChange(!open), [handleOpenChange, open]),
  );

  const resultIndicator =
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

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<FloatingSearchButton />} />
      <DialogContent
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-[calc(100%-1.5rem)] border border-outline-alt bg-surface-container p-3 sm:p-4 gap-3 sm:gap-4 shadow-[0_8px_24px_rgb(0_0_0/25%)] sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl"
        showCloseButton={false}
      >
        <SearchGroup
          autoFocus
          className="shrink-0"
          endIcon={<X className="size-4" />}
          onClear={() => handleQueryChange("")}
          onValueChange={handleQueryChange}
          placeholder="Search movies and series"
          showClearButton
          startIcon={<Search className="size-5" />}
          value={query}
        />

        <SearchControls
          mediaType={mediaType}
          onMediaTypeChange={handleMediaTypeChange}
          onRegionChange={handleRegionChange}
          onYearChange={handleYearChange}
          region={region}
          resultIndicator={resultIndicator}
          resultText={resultText}
          year={year}
        />

        {searchState.status === "failed" ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ContentErrorState
              compact
              message={searchState.error ?? "The search request failed."}
              onRetry={() =>
                requestSearch(page, searchState.query || query.trim())
              }
            />
          </div>
        ) : (
          <MovieLists
            mediaType={mediaType}
            onItemClick={() => handleOpenChange(false)}
            results={searchState.results}
            status={searchState.status}
          />
        )}

        {showPagination ? (
          <div className="-mx-3 -mb-3 shrink-0 border-t border-outline-alt bg-surface-container-low px-3 py-2 sm:-mx-4 sm:-mb-4 sm:px-4">
            <SearchPagination
              disabled={searchState.status === "loading"}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                requestSearch(nextPage);
              }}
              page={page}
              totalPages={searchState.total_pages}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
