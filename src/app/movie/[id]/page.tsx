"use client";

import { AppShell } from "@/components/ui/app-shell";
import { HeroHeader } from "@/components/title-detail/hero-header";
import { TitleProgress } from "@/components/title-detail/progress";
import { useContentDetails } from "@/hooks/use-content-details";
import type { MovieDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const { data: movie } = useContentDetails<MovieDetails>(`/api/movie/${id}`);

  return (
    <AppShell>
      <main>
        <HeroHeader movie={movie} type="movie" />
        <TitleProgress type="movie" />
      </main>
    </AppShell>
  );
}
