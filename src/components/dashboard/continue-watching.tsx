"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { MovieCard } from "@/components/custom/movie-card";
import { SeriesCard } from "@/components/custom/series-card";
import { Button } from "@/components/ui/button";
import type { LibraryMovie, LibrarySeries } from "@/lib/types";

export function ContinueWatching({
  movies,
  series,
}: {
  movies: LibraryMovie[];
  series: LibrarySeries[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const totalItems = movies.length + series.length;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      aria-labelledby="continue-watching-heading"
      className="flex w-full flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-container/20 text-brand-primary">
            <PlayCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2
              id="continue-watching-heading"
              className="font-heading text-xl font-semibold tracking-tight text-on-surface sm:text-2xl"
            >
              Continue Watching
            </h2>
            <p className="mt-0.5 font-public-sans text-xs text-secondary">
              {totalItems > 0
                ? `${totalItems} ${totalItems === 1 ? "title" : "titles"} in progress`
                : "Resume your active movies and series"}
            </p>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="flex items-center gap-1.5">
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

      {totalItems > 0 ? (
        <div
          ref={scrollContainerRef}
          className="movie-lists-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {movies.map((movie) => (
            <div key={`movie-${movie.tmdb_id}`} className="shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
          {series.map((show) => (
            <div key={`series-${show.tmdb_id}`} className="shrink-0">
              <SeriesCard series={show} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/10 bg-surface-container-low px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-secondary">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-medium text-on-surface">
              No titles in progress
            </h3>
            <p className="max-w-sm font-public-sans text-xs text-secondary">
              Movies and series you mark as &quot;Watching&quot; in your library
              will appear here for quick access.
            </p>
          </div>
          <Link
            href="/library"
            className="group/button inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-brand-primary-container bg-clip-padding px-2.5 text-sm font-medium whitespace-nowrap text-white transition-all outline-none select-none hover:bg-brand-primary-container/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px"
          >
            Browse My Library
          </Link>
        </div>
      )}
    </section>
  );
}
