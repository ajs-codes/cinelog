"use client";

import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ContinueWatching } from "@/components/dashboard/continue-watching";
import { ContentLoadingOverlay } from "@/components/custom/content-loading-overlay";
import { useAppDispatch, useAppSelector } from "@/store";
import { libraryRequested } from "@/store/slices/librarySlice";
import { Sparkles, Film, Tv } from "lucide-react";

export default function Home() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { movies, series, status } = useAppSelector((state) => state.library);

  useEffect(() => {
    dispatch(libraryRequested());
  }, [dispatch]);

  const watchingMovies = useMemo(
    () => movies.filter((movie) => movie.watch_status === 1),
    [movies],
  );

  const watchingSeries = useMemo(
    () =>
      series.filter((show) => {
        if (show.watch_status === 1) return true;

        const watched = show.total_number_of_episodes_watched ?? 0;
        const total = show.total_number_of_episodes ?? 0;
        return watched > 0 && watched < total;
      }),
    [series],
  );

  const displayName = user?.displayName || user?.username;
  const isLoading = status === "idle" || status === "loading";

  return (
    <AppShell>
      <main className="relative min-h-[calc(100vh-3.5rem)] px-5 pt-6 pb-8 sm:px-8 lg:pt-8 lg:pb-10">
        <div
          aria-hidden={isLoading}
          className={`mx-auto flex w-full max-w-[1720px] flex-col gap-8 ${
            isLoading ? "blur-sm transition-all duration-300" : ""
          }`}
        >
          <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-r from-surface-container-low via-surface-container to-surface-container-low px-6 py-5 sm:px-8 sm:py-6">
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-primary-container/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary-container/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                  <Sparkles className="h-3 w-3" />
                  <span>Welcome Back</span>
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                    {displayName
                      ? `Welcome back, ${displayName}!`
                      : "Welcome to CineLog"}
                  </h1>
                  <p className="mt-2 max-w-xl font-public-sans text-xs text-secondary sm:text-sm">
                    Track your movies, binge series, and continue right where
                    you left off.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2">
                  <Film className="h-4 w-4 text-brand-primary" />
                  <span className="font-public-sans text-xs text-on-surface">
                    {movies.length} Movies
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2">
                  <Tv className="h-4 w-4 text-brand-tertiary" />
                  <span className="font-public-sans text-xs text-on-surface">
                    {series.length} Series
                  </span>
                </div>
              </div>
            </div>
          </header>

          <ContinueWatching movies={watchingMovies} series={watchingSeries} />

          {/* User Stats / Dashboard Summary
          <section className="space-y-4 pt-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-on-surface">
              Library Insights
            </h2>
            <UserStats />
          </section> */}
        </div>

        {isLoading && <ContentLoadingOverlay />}
      </main>
    </AppShell>
  );
}
