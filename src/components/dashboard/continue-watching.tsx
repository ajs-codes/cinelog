"use client";

import { PlayCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { EmptyState } from "@/components/ui/empty-state";
import { MovieCard } from "@/components/ui/movie-card";
import { SeriesCard } from "@/components/ui/series-card";
import type { LibraryMovie, LibrarySeries } from "@/lib/types";

export function ContinueWatching({
  movies,
  series,
}: {
  movies: LibraryMovie[];
  series: LibrarySeries[];
}) {
  const totalItems = movies.length + series.length;

  return (
    <Carousel
      empty={
        <EmptyState
          action={
            <ButtonLink href="/library" variant="primaryFilled">
              Browse My Library
            </ButtonLink>
          }
          description='Movies and series you mark as "Watching" in your library will appear here for quick access.'
          icon={<PlayCircle className="h-6 w-6" />}
          title="No titles in progress"
        />
      }
      headingId="continue-watching-heading"
      icon={<PlayCircle className="h-5 w-5" />}
      navAlwaysVisible
      showNav={totalItems > 0}
      subtitle={
        <p className="mt-0.5 truncate font-public-sans text-xs text-secondary">
          {totalItems > 0
            ? `${totalItems} ${totalItems === 1 ? "title" : "titles"} in progress`
            : "Resume your active movies and series"}
        </p>
      }
      title="Continue Watching"
    >
      {totalItems > 0
        ? [
            ...movies.map((movie) => (
              <div className="w-40 shrink-0 sm:w-60" key={`movie-${movie.tmdb_id}`}>
                <MovieCard movie={movie} />
              </div>
            )),
            ...series.map((show) => (
              <div className="w-40 shrink-0 sm:w-60" key={`series-${show.tmdb_id}`}>
                <SeriesCard series={show} />
              </div>
            )),
          ]
        : undefined}
    </Carousel>
  );
}
