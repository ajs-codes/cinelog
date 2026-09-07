"use client";

import { MovieCard } from "@/components/custom/MovieCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-secondary">
        CineLog
      </p>

      <h1 className="text-4xl font-semibold tracking-tight text-on-surface">
        Your movie log starts here.
      </h1>

      <p className="max-w-md text-secondary">
        A Next.js foundation with typed API routes, Zod validation, Drizzle, and
        Redux Saga.
      </p>

      <Button variant="primaryFilled" onClick={() => router.push("/dashboard")}>
        Open dashboard
      </Button>

      <MovieCard
        movie={{
          releaseYear: 2022,
          posterImage:
            "https://www.figma.com/api/mcp/asset/3fd27b50-b02b-4c77-ab7a-eb88e7a6e75a.png",
          rating: 3.9,
          episodeInfo: "S2 : E4 • EP 4 OF 10",
          title: "Severance",
          completion: 40,
          type: "Series",
        }}
      />
    </main>
  );
}
