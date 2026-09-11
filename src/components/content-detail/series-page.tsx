"use client";

import { CastCrew } from "@/components/content-detail/cast-crew";
import { HeroHeader } from "@/components/content-detail/hero-header/hero-header";
import { ContentProgress } from "@/components/content-detail/progress/content-progress";
import { SpecificationsMeta } from "@/components/content-detail/specifications-meta";
import { ContentErrorState } from "@/components/custom/content-error-state";
import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { SeriesDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: series,
    error,
    isLoading,
    retry,
  } = useContentDetails<SeriesDetails>("series", id);

  if (isLoading) {
    return (
      <main className="relative min-h-[calc(100vh-3.5rem)]">
        <div aria-hidden="true" className="blur-sm">
          <HeroHeader type="series" />
          <ContentProgress type="series" />
          <SpecificationsMeta type="series" />
        </div>
        <ContentLoadingOverlay />
      </main>
    );
  }

  if (error || !series) {
    return (
      <ContentErrorState
        message={error?.message ?? "The series could not be loaded."}
        onRetry={retry}
      />
    );
  }

  return (
    <main>
      <HeroHeader series={series} type="series" />
      <ContentProgress series={series} type="series" />
      <div className="grid grid-cols-1 items-start lg:grid-cols-2">
        <SpecificationsMeta series={series} type="series" />
        <CastCrew credits={series.credits} createdBy={series.created_by} />
      </div>
    </main>
  );
}
