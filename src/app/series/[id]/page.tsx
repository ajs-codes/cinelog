"use client";

import { AppShell } from "@/components/ui/app-shell";
import { HeroHeader } from "@/components/title-detail/hero-header";
import { TitleProgress } from "@/components/title-detail/progress";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { SeriesDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: series } = useContentDetails<SeriesDetails>(
    `/api/series/${id}`,
  );

  return (
    <AppShell>
      <main>
        <HeroHeader series={series} type="series" />
        <TitleProgress series={series} type="series" />
      </main>
    </AppShell>
  );
}
