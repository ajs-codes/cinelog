"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { MovieCard } from "@/components/custom/movie-card";
import { SeriesCard } from "@/components/custom/series-card";
import { Button } from "@/components/ui/button";
import type {
  CustomCollectionWithFilters,
  LibraryMovie,
  LibrarySeries,
} from "@/lib/types";
import { filterCollectionItems } from "@/lib/media/collection-filter";

const OPERATOR_SYMBOLS: Record<number, string> = {
  0: "=",
  1: "!=",
  2: ">",
  3: "<",
  4: "in",
  5: "contains",
};

const FIELD_LABELS: Record<string, string> = {
  release_year: "Year",
  certification: "Cert",
  original_language: "Lang",
  origin_country: "Origin",
  genre: "Genre",
};

export function CollectionCarousel({
  collection,
  movies,
  series,
}: {
  collection: CustomCollectionWithFilters;
  movies: LibraryMovie[];
  series: LibrarySeries[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const matchingItems = filterCollectionItems(collection, movies, series);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const count = matchingItems.length;

  return (
    <section
      aria-labelledby={`collection-${collection.id}-heading`}
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-container/20 text-brand-primary">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={`collection-${collection.id}-heading`}
                className="font-heading text-lg font-semibold tracking-tight text-on-surface sm:text-2xl"
              >
                {collection.name}
              </h2>
              <span className="rounded-md border border-white/10 bg-surface-container-high px-2 py-0.5 font-public-sans text-[10px] font-medium text-secondary">
                {collection.mediaType === 0 ? "Movies" : "Series"}
              </span>
              <span className="font-public-sans text-xs text-outline-muted">
                {count} {count === 1 ? "title" : "titles"}
              </span>
            </div>

            {collection.filters.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-secondary">
                <span className="text-[10px] font-semibold tracking-wider text-outline-muted uppercase">
                  Query:
                </span>
                {collection.filters.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-on-surface">
                      {FIELD_LABELS[f.field] || f.field}{" "}
                      <span className="text-brand-primary">
                        {OPERATOR_SYMBOLS[f.operator] || "="}
                      </span>{" "}
                      {f.value}
                    </span>
                    {i < collection.filters.length - 1 && (
                      <span className="text-[10px] font-bold text-outline-muted">
                        AND
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {count > 0 && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button
              variant="darkFilled"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="h-8 w-8 rounded-full border-white/10 bg-surface-container-low text-on-surface hover:bg-surface-container hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="darkFilled"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="h-8 w-8 rounded-full border-white/10 bg-surface-container-low text-on-surface hover:bg-surface-container hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {count > 0 ? (
        <div
          ref={scrollContainerRef}
          className="movie-lists-scrollbar -mx-1 flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-1 overscroll-contain"
        >
          {matchingItems.map((item) => {
            const isMovie = "title" in item;
            return (
              <div
                key={`${isMovie ? "movie" : "series"}-${item.tmdb_id}`}
                className="w-60 shrink-0"
              >
                {isMovie ? (
                  <MovieCard movie={item as LibraryMovie} />
                ) : (
                  <SeriesCard series={item as LibrarySeries} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-surface-container-low p-6 text-center">
          <p className="font-public-sans text-xs text-secondary">
            No titles in your library match this filter group yet.
          </p>
        </div>
      )}
    </section>
  );
}
