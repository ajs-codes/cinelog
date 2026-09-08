"use client";

import { AppShell } from "@/components/ui/app-shell";
import { HeroHeader } from "@/components/title-detail/hero-header";
import { useContentDetails } from "@/hooks/title-details/use-content-details";
import type { MovieDetails } from "@/lib/types";
import { useParams } from "next/navigation";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const { data: movie } = useContentDetails<MovieDetails>(`/api/movie/${id}`);

  return (
    <AppShell>
      <main>
        <HeroHeader movie={movie} type="movie" />
      </main>
    </AppShell>
  );
}
