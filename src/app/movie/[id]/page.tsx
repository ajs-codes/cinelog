"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ContentErrorState } from "@/components/ui/content-error-state";
import { ContentLoadingOverlay } from "@/components/ui/content-loading-overlay";
import { HeroHeader } from "@/components/title-detail/hero-header";
import { TitleProgress } from "@/components/title-detail/progress";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { MovieDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: movie,
    error,
    isLoading,
    retry,
  } = useContentDetails<MovieDetails>("movie", id);

  return (
    <AppShell>
      {isLoading ? (
        <main className="relative min-h-[calc(100vh-3.5rem)]">
          <div aria-hidden="true" className="blur-sm">
            <HeroHeader type="movie" />
            <TitleProgress type="movie" />
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
          <TitleProgress type="movie" />
        </main>
      )}
    </AppShell>
  );
}
