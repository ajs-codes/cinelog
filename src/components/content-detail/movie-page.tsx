"use client";

import { CastCrew } from "@/components/content-detail/cast-crew";
import { HeroHeader } from "@/components/content-detail/hero-header/hero-header";
import { ContentProgress } from "@/components/content-detail/progress/content-progress";
import { SpecificationsMeta } from "@/components/content-detail/specifications-meta";
import { ContentErrorState } from "@/components/custom/content-error-state";
import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { MovieDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: movie,
    error,
    isLoading,
    retry,
  } = useContentDetails<MovieDetails>("movie", id);

  if (isLoading) {
    return (
      <main className="relative min-h-[calc(100vh-3.5rem)]">
        <div aria-hidden="true" className="blur-sm">
          <HeroHeader type="movie" />
          <SpecificationsMeta type="movie" />
          <ContentProgress type="movie" />
        </div>
        <ContentLoadingOverlay />
      </main>
    );
  }

  if (error || !movie) {
    return (
      <ContentErrorState
        message={error?.message ?? "The movie could not be loaded."}
        onRetry={retry}
      />
    );
  }

  return (
    <main>
      <HeroHeader movie={movie} type="movie" />
      <div className="grid grid-cols-1 items-start lg:grid-cols-2">
        <SpecificationsMeta movie={movie} type="movie" />
        <CastCrew credits={movie.credits} />
      </div>
    </main>
  );
}
