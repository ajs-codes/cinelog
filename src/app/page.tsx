"use client";

import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { UserStats } from "@/components/dashboard/user-stats";
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

  const watchingItems = useMemo(() => {
    const allTitles = [...movies, ...series];
    return allTitles.filter(
      (item) =>
        item.watchStatus === 1 ||
        (item.completion > 0 && item.completion < 100),
    );
  }, [movies, series]);

  const displayName = user?.displayName || user?.username;
  const isLoading = status === "idle" || status === "loading";

  return (
    <AppShell>
      <main className="relative min-h-[calc(100vh-3.5rem)] px-5 py-8 sm:px-8 lg:py-10">
        <div
          aria-hidden={isLoading}
          className={`mx-auto max-w-[1720px] space-y-10 ${
            isLoading ? "blur-sm transition-all duration-300" : ""
          }`}
        >
          {/* Welcome Banner */}
          <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-r from-surface-container-low via-surface-container to-surface-container-low p-6 sm:p-8">
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-primary-container/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary-container/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Welcome Back</span>
                </div>
                <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                  {displayName
                    ? `Welcome back, ${displayName}!`
                    : "Welcome to CineLog"}
                </h1>
                <p className="mt-2 max-w-xl font-public-sans text-xs text-secondary sm:text-sm">
                  Track your movies, binge series, and continue right where you
                  left off.
                </p>
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

          {/* Continue Watching Section */}
          <ContinueWatching items={watchingItems} />

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
