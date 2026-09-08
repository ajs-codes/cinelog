"use client";

import { MovieCard, type MovieCardData } from "@/components/custom/movie-card";
import { AppShell } from "@/components/layout/app-shell";
// import { UserStats } from "@/components/dashboard/user-stats";

const posterImages = [
  "https://www.figma.com/api/mcp/asset/3fd27b50-b02b-4c77-ab7a-eb88e7a6e75a.png",
  "https://www.figma.com/api/mcp/asset/1bce3ee3-069b-4914-8c1c-179c0dd92c28.png",
  "https://www.figma.com/api/mcp/asset/e70e21d5-2d5a-4c82-a5e2-727f9c03b734.png",
  "https://www.figma.com/api/mcp/asset/5e9497f8-630e-4212-83ba-5a75007729ea.png",
];

const continuing: MovieCardData[] = [
  {
    title: "Severance",
    releaseYear: 2022,
    rating: 4.9,
    episodeInfo: "S2 : E4 • EP 4 OF 10",
    completion: 40,
    type: "Series",
    posterImage: posterImages[0],
  },
  {
    title: "Frieren: Journey's End",
    releaseYear: 2023,
    rating: 5,
    episodeInfo: "EP 21 OF 28",
    completion: 78,
    type: "Series",
    posterImage: posterImages[1],
  },
  {
    title: "The Bear",
    releaseYear: 2022,
    rating: 4.8,
    episodeInfo: "S3 : E2",
    completion: 65,
    type: "Series",
    posterImage: posterImages[2],
  },
  {
    title: "Shogun",
    releaseYear: 2024,
    rating: 4.8,
    episodeInfo: "EP 8 OF 10",
    completion: 80,
    type: "Series",
    posterImage: posterImages[3],
  },
];

export default function Home() {
  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-[1720px] flex-col gap-9 px-5 py-10 sm:px-8 lg:py-14">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
              Welcome back,{" "}
              <em className="font-normal text-brand-primary">AJS</em>
            </h1>
            <p className="mt-2 font-public-sans text-xs text-secondary">
              3,482 titles cataloged across 12 archives{" "}
              <span className="px-2 text-outline-muted">•</span> All cloud
              backups verified immutable
            </p>
          </div>
          <p className="font-public-sans text-xs text-outline-muted">
            Last synced 2 minutes ago
          </p>
        </section>

        {/* TODO: will implement later */}
        {/* <UserStats /> */}

        <Shelf
          title="Continue watching"
          meta="4 sessions in progress"
          action="View active queue"
          movies={continuing}
        />
        <Shelf
          title="World Cinema & Classics"
          meta="128 curated titles"
          action="Browse all 128"
          movies={continuing.slice().reverse()}
        />
        <Shelf
          title="Anime Series & OVAs"
          meta="86 vaulted series"
          action="Open Vault"
          movies={continuing}
        />
      </main>
    </AppShell>
  );
}

function Shelf({
  title,
  meta,
  action,
  movies,
}: {
  title: string;
  meta: string;
  action: string;
  movies: MovieCardData[];
}) {
  return (
    <section className="min-w-0" aria-labelledby={title}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2
            id={title}
            className="truncate font-heading text-xl tracking-tight text-on-surface"
          >
            {title}
          </h2>
          <span className="shrink-0 font-public-sans text-[10px] text-outline-muted">
            {meta}
          </span>
        </div>
        <button
          className="shrink-0 font-public-sans text-[10px] text-brand-primary transition-colors hover:text-on-surface"
          type="button"
        >
          {action} <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {movies.map((movie) => (
          <div
            key={`${title}-${movie.title}`}
            className="w-60 min-w-60 shrink-0 snap-start"
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}
