"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ContentErrorState } from "@/components/ui/content-error-state";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MovieLists } from "@/components/search-popup/movie-lists";
import { SearchGroup } from "@/components/ui/search-group";
import { FloatingSearchButton } from "@/components/search-popup/floating-search-button";
import {
  SearchControls,
  type SearchMediaType,
} from "@/components/search-popup/search-controls";
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<FloatingSearchButton />} />
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] border border-outline-alt bg-surface-container shadow-[0_8px_24px_rgb(0_0_0/25%)] sm:max-w-3xl"
        showCloseButton={false}
      >
        <SearchGroup
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
            onItemClick={() => setOpen(false)}
            results={searchState.results}
            status={searchState.status}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
