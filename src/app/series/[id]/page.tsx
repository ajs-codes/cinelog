"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ContentErrorState } from "@/components/custom/content-error-state";
import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { HeroHeader } from "@/components/content-detail";
import { ContentProgress } from "@/components/content-detail/progress/content_progress";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { SeriesDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: series,
    error,
    isLoading,
    retry,
  } = useContentDetails<SeriesDetails>("series", id);

  return (
    <AppShell>
      {isLoading ? (
        <main className="relative min-h-[calc(100vh-3.5rem)]">
          <div aria-hidden="true" className="blur-sm">
            <HeroHeader type="series" />
            <ContentProgress type="series" />
          </div>
          <ContentLoadingOverlay />
        </main>
      ) : error || !series ? (
        <ContentErrorState
          message={error?.message ?? "The series could not be loaded."}
          onRetry={retry}
        />
      ) : (
        <main>
          <HeroHeader series={series} type="series" />
          <ContentProgress series={series} type="series" />
        </main>
      )}
    </AppShell>
  );
}
