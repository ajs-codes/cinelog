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
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state.search[mediaType]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
    }
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
      : `${searchState.results.length} results`;

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length <= 0) {
      dispatch(searchCleared(mediaType));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(searchRequested({ mediaType, query: normalizedQuery }));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, mediaType, query]);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<FloatingSearchButton />} />
      <DialogContent
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-[calc(100%-1.5rem)] border border-outline-alt bg-surface-container p-3 sm:p-4 gap-3 sm:gap-4 shadow-[0_8px_24px_rgb(0_0_0/25%)] sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl"
        showCloseButton={false}
      >
        <SearchGroup
          autoFocus
          endIcon={<X className="size-4" />}
          onClear={() => setQuery("")}
          onValueChange={setQuery}
          placeholder="Search movies and series"
          showClearButton
          startIcon={<Search className="size-5" />}
          value={query}
        />

        <SearchControls
          mediaType={mediaType}
          onMediaTypeChange={setMediaType}
          resultIndicator={resultIndicator}
          resultText={resultText}
        />

        {searchState.status === "failed" ? (
          <ContentErrorState
            compact
            message={searchState.error ?? "The search request failed."}
            onRetry={() =>
              dispatch(
                searchRequested({
                  mediaType,
                  query: searchState.query,
                }),
              )
            }
          />
        ) : (
          <MovieLists
            mediaType={mediaType}
            onItemClick={() => handleOpenChange(false)}
            results={searchState.results}
            status={searchState.status}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
