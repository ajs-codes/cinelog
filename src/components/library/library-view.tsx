"use client";

import { useEffect } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { MovieCard } from "@/components/ui/movie-card";
import { SeriesCard } from "@/components/ui/series-card";
import { LibraryFilterControls } from "@/components/library/library-filter-controls";
import { LibrarySection } from "@/components/library/library-section";
import type { LibraryMediaType } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  libraryPageRequested,
  libraryRequested,
} from "@/store/slices/librarySlice";

type LibraryViewProps = {
  mediaType?: LibraryMediaType;
};

export function LibraryView({ mediaType = "movie" }: LibraryViewProps) {
  const dispatch = useAppDispatch();
  const {
    movies,
    series,
    movieCount,
    seriesCount,
    moviesHasMore,
    seriesHasMore,
    moviesLoaded,
    seriesLoaded,
    moviesLoadingMore,
    seriesLoadingMore,
    status,
    error,
  } = useAppSelector((state) => state.library);

  useEffect(() => {
    dispatch(libraryRequested({ type: mediaType }));
  }, [dispatch, mediaType]);

  const total = movieCount + seriesCount;
  const isMovies = mediaType === "movie";
  const isLoaded = isMovies ? moviesLoaded : seriesLoaded;
  const isLoading = !isLoaded && status !== "failed";

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] px-3.5 py-6 sm:px-8 lg:py-10">
      <div
        aria-hidden={isLoading}
        className={`mx-auto flex w-full min-w-0 flex-col gap-6 sm:gap-8 ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <header className="flex flex-col gap-4 sm:gap-5">
          <div>
            <h1 className="font-heading text-2xl tracking-tight sm:text-4xl">
              My library
            </h1>
            <p className="mt-1 font-public-sans text-xs text-secondary sm:mt-2">
              {isLoading
                ? "Loading your watchlist"
                : `${total} titles in your watchlist`}
            </p>
          </div>

          <LibraryFilterControls
            movieCount={movieCount}
            seriesCount={seriesCount}
            mediaType={mediaType}
          />
        </header>

        {status === "failed" ? (
          <div className="rounded-lg border border-status-error/30 bg-surface-container-low px-4 py-8 text-center font-public-sans text-sm text-status-error">
            {error ?? "Failed to load your watchlist."}
          </div>
        ) : (
          <>
            {isMovies ? (
              <LibrarySection
                title="Movies"
                count={movieCount}
                hasMore={moviesHasMore}
                loadingMore={moviesLoadingMore}
                onLoadMore={() =>
                  dispatch(libraryPageRequested({ type: "movie" }))
                }
              >
                {movies.map((movie) => (
                  <MovieCard key={movie.tmdb_id} movie={movie} />
                ))}
              </LibrarySection>
            ) : (
              <LibrarySection
                title="Series"
                count={seriesCount}
                hasMore={seriesHasMore}
                loadingMore={seriesLoadingMore}
                onLoadMore={() =>
                  dispatch(libraryPageRequested({ type: "series" }))
                }
              >
                {series.map((show) => (
                  <SeriesCard key={show.tmdb_id} series={show} />
                ))}
              </LibrarySection>
            )}
          </>
        )}
      </div>
      {isLoading && <LoadingOverlay />}
    </main>
  );
}

