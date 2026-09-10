"use client";

import { AppShell } from "@/components/layout/app-shell";
import { CastCrew } from "@/components/content-detail/cast-crew";
import { ContentErrorState } from "@/components/custom/content-error-state";
import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { HeroHeader } from "@/components/content-detail/hero-header/hero-header";
import { SpecificationsMeta } from "@/components/content-detail/specifications-meta";
import { ContentProgress } from "@/components/content-detail/progress/content-progress";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { MovieDetails } from "@/lib/types";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { Loader2 } from "lucide-react";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: movie,
    error,
    isLoading,
    retry,
  } = useContentDetails<MovieDetails>("movie", id);
  const isMutating = useAppSelector(
    (state) => state.contentDetails.movie[id]?.mutationStatus === "loading",
  );

  return (
    <AppShell>
      {isLoading ? (
        <main className="relative min-h-[calc(100vh-3.5rem)]">
          <div aria-hidden="true" className="blur-sm">
            <HeroHeader type="movie" />
            <SpecificationsMeta type="movie" />
            <ContentProgress type="movie" />
          </div>
          <ContentLoadingOverlay />
        </main>
      ) : error || !movie ? (
        <ContentErrorState
          message={error?.message ?? "The movie could not be loaded."}
          onRetry={retry}
        />
      ) : (
        <main>
          <HeroHeader movie={movie} type="movie" />
          <div className="grid grid-cols-1 items-start lg:grid-cols-2">
            <SpecificationsMeta movie={movie} type="movie" />
            <CastCrew credits={movie.credits} />
          </div>
        </main>
      )}

      {isMutating && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-white/10 bg-surface-container-high/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
          <span>Saving changes...</span>
        </div>
      )}
    </AppShell>
  );
}
