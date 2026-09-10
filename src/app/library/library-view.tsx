"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { MovieCard } from "@/components/custom/movie-card";
import { SeriesCard } from "@/components/custom/series-card";
import { CollectionCarousel } from "@/components/library/collection-carousel";
import {
  LibraryFilterControls,
  type LibraryMediaType,
} from "@/components/library/library-filter-controls";
import type { CustomCollectionWithFilters } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { libraryRequested } from "@/store/slices/librarySlice";

const COLLECTION_MEDIA_TYPE: Record<LibraryMediaType, number> = {
  movie: 0,
  series: 1,
};

export function LibraryView() {
  const dispatch = useAppDispatch();
  const { movies, series, status, error } = useAppSelector(
    (state) => state.library,
  );
  const [collections, setCollections] = useState<CustomCollectionWithFilters[]>(
    [],
  );
  const [mediaType, setMediaType] = useState<LibraryMediaType>("movie");

  useEffect(() => {
    if (status === "idle") {
      dispatch(libraryRequested());
    }
  }, [dispatch, status]);

  const collectionsFetchedRef = useRef(false);

  useEffect(() => {
    if (collectionsFetchedRef.current) return;
    collectionsFetchedRef.current = true;

    async function fetchCollections() {
      try {
        const res = await fetch("/api/collections");
        if (res.ok) {
          const data = await res.json();
          const cols = data.collections ?? data.data?.collections;
          if (cols) {
            setCollections(cols);
          }
        }
      } catch {
        // Fallback: collections won't display if network fails
      }
    }

    fetchCollections();
  }, []);

  const total = movies.length + series.length;
  const isLoading = status === "idle" || status === "loading";
  const isMovies = mediaType === "movie";
  const activeCount = isMovies ? movies.length : series.length;
  const activeCountText = isMovies
    ? `${activeCount} ${activeCount === 1 ? "movie" : "movies"}`
    : `${activeCount} series`;
  const activeLibraryCollections = useMemo(
    () =>
      collections.filter(
        (collection) =>
          collection.showInLibrary &&
          collection.mediaType === COLLECTION_MEDIA_TYPE[mediaType],
      ),
    [collections, mediaType],
  );

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] px-5 py-8 sm:px-8 lg:py-10">
      <div
        aria-hidden={isLoading}
        className={`mx-auto flex w-full max-w-[1720px] flex-col gap-8 ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <header className="flex flex-col gap-5">
          <div>
            <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
              My library
            </h1>
            <p className="mt-2 font-public-sans text-xs text-secondary">
              {isLoading
                ? "Loading your watchlist"
                : `${total} titles in your watchlist`}
            </p>
          </div>

          <LibraryFilterControls
            countText={activeCountText}
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
          />
        </header>

        {status === "failed" ? (
          <div className="rounded-lg border border-status-error/30 bg-surface-container-low px-4 py-8 text-center font-public-sans text-sm text-status-error">
            {error ?? "Failed to load your watchlist."}
          </div>
        ) : (
          <>
            {activeLibraryCollections.length > 0 && (
              <div className="flex flex-col gap-8">
                {activeLibraryCollections.map((collection) => (
                  <CollectionCarousel
                    key={collection.id}
                    collection={collection}
                    movies={movies}
                    series={series}
                  />
                ))}
                <div className="h-px w-full bg-outline-alt/60" />
              </div>
            )}

            {isMovies ? (
              <LibrarySection title="Movies" count={movies.length}>
                {movies.map((movie) => (
                  <MovieCard key={movie.tmdb_id} movie={movie} />
                ))}
              </LibrarySection>
            ) : (
              <LibrarySection title="Series" count={series.length}>
                {series.map((show) => (
                  <SeriesCard key={show.tmdb_id} series={show} />
                ))}
              </LibrarySection>
            )}
          </>
        )}
      </div>
      {isLoading && <ContentLoadingOverlay />}
    </main>
  );
}

function LibrarySection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const headingId = `${title.toLowerCase()}-heading`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2
        className="font-heading text-xl tracking-tight text-on-surface"
        id={headingId}
      >
        {title}
      </h2>

      {count > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,15rem)] gap-x-4 gap-y-6">
          {children}
        </div>
      ) : (
        <p className="rounded-lg border border-white/10 bg-surface-container-low px-4 py-8 text-center font-public-sans text-sm text-secondary">
          No {title.toLowerCase()} in your watchlist yet.
        </p>
      )}
    </section>
  );
}
