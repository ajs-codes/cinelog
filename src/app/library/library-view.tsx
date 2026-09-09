"use client";

import { useEffect } from "react";

import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { MovieCard } from "@/components/custom/movie-card";
import { SeriesCard } from "@/components/custom/series-card";
import { useAppDispatch, useAppSelector } from "@/store";
import { libraryRequested } from "@/store/slices/librarySlice";

export function LibraryView() {
  const dispatch = useAppDispatch();
  const { movies, series, status, error } = useAppSelector(
    (state) => state.library,
  );

  useEffect(() => {
    dispatch(libraryRequested());
  }, [dispatch]);

  const total = movies.length + series.length;
  const isLoading = status === "idle" || status === "loading";

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)]">
      <div
        aria-hidden={isLoading}
        className={`mx-auto flex w-full max-w-[1720px] flex-col gap-10 px-5 py-10 sm:px-8 lg:py-14 ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <header>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
            My library
          </h1>
          <p className="mt-2 font-public-sans text-xs text-secondary">
            {isLoading
              ? "Loading your watchlist"
              : `${total} titles in your watchlist`}
          </p>
        </header>

        {status === "failed" ? (
          <div className="rounded-lg border border-status-error/30 bg-surface-container-low px-4 py-8 text-center font-public-sans text-sm text-status-error">
            {error ?? "Failed to load your watchlist."}
          </div>
        ) : (
          <>
            <LibrarySection title="Movies" count={movies.length}>
              {movies.map((movie) => (
                <div className="w-60" key={movie.tmdb_id}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </LibrarySection>
            <LibrarySection title="Series" count={series.length}>
              {series.map((show) => (
                <div className="w-60" key={show.tmdb_id}>
                  <SeriesCard series={show} />
                </div>
              ))}
            </LibrarySection>
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
  return (
    <section aria-labelledby={`${title.toLowerCase()}-heading`}>
      <div className="mb-4 flex items-baseline gap-2">
        <h2
          className="font-heading text-xl tracking-tight text-on-surface"
          id={`${title.toLowerCase()}-heading`}
        >
          {title}
        </h2>
        <span className="font-public-sans text-[10px] text-outline-muted">
          {count} {count === 1 ? "title" : "titles"}
        </span>
      </div>

      {count > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
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
