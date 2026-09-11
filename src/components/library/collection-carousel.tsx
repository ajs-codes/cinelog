"use client";

import { Layers } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterQueryChips } from "@/components/ui/filter-query-chips";
import { MovieCard } from "@/components/ui/movie-card";
import { SeriesCard } from "@/components/ui/series-card";
import type {
  CustomCollectionWithFilters,
  LibraryMovie,
  LibrarySeries,
} from "@/lib/types";
import { filterCollectionItems } from "@/lib/media/collection-filter";

export function CollectionCarousel({
  collection,
  movies,
  series,
}: {
  collection: CustomCollectionWithFilters;
  movies: LibraryMovie[];
  series: LibrarySeries[];
}) {
  const matchingItems = filterCollectionItems(collection, movies, series);
  const count = matchingItems.length;

  return (
    <Carousel
      extraHeader={
        <>
          <span className="rounded-md border border-white/10 bg-surface-container-high px-2 py-0.5 font-public-sans text-[10px] font-medium text-secondary">
            {collection.mediaType === 0 ? "Movies" : "Series"}
          </span>
          <span className="font-public-sans text-xs text-outline-muted">
            {count} {count === 1 ? "title" : "titles"}
          </span>
        </>
      }
      empty={
        <EmptyState description="No titles in your library match this filter group yet." />
      }
      headingId={`collection-${collection.id}-heading`}
      icon={<Layers className="h-4.5 w-4.5" />}
      showNav={count > 0}
      subtitle={<FilterQueryChips filters={collection.filters} />}
      title={collection.name}
    >
      {count > 0
        ? matchingItems.map((item) => {
            const isMovie = "title" in item;
            return (
              <div
                className="w-40 shrink-0 sm:w-60"
                key={`${isMovie ? "movie" : "series"}-${item.tmdb_id}`}
              >
                {isMovie ? (
                  <MovieCard movie={item as LibraryMovie} />
                ) : (
                  <SeriesCard series={item as LibrarySeries} />
                )}
              </div>
            );
          })
        : undefined}
    </Carousel>
  );
}
