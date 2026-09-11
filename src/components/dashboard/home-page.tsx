"use client";

import { ContinueWatching } from "@/components/dashboard/continue-watching";
import {
  PLACEHOLDER_MOVIE_COUNT,
  PLACEHOLDER_SERIES_COUNT,
} from "@/lib/constants";
import { useAppSelector } from "@/store";
import { Film, Sparkles, Tv } from "lucide-react";

export function HomePage() {
  const { user } = useAppSelector((state) => state.auth);
  const displayName = user?.displayName || user?.username;

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] px-3.5 pt-5 pb-8 sm:px-8 sm:pt-6 lg:pt-8 lg:pb-10">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 sm:gap-8">
        <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-r from-surface-container-low via-surface-container to-surface-container-low px-4 py-4 sm:px-8 sm:py-6">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-primary-container/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary-container/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                <Sparkles className="h-3 w-3" />
                <span>Welcome Back</span>
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-4xl">
                  {displayName
                    ? `Welcome back, ${displayName}!`
                    : "Welcome to CineLog"}
                </h1>
                <p className="mt-1 max-w-xl font-public-sans text-xs text-secondary sm:mt-2 sm:text-sm">
                  Track your movies, binge series, and continue right where you
                  left off.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:gap-3 sm:self-auto">
              <div className="flex items-center gap-2 rounded-lg bg-surface-container-high px-2.5 py-1.5 sm:px-3 sm:py-2">
                <Film className="h-3.5 w-3.5 shrink-0 text-brand-primary sm:h-4 sm:w-4" />
                <span className="font-public-sans text-xs text-on-surface">
                  {PLACEHOLDER_MOVIE_COUNT} Movies
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-container-high px-2.5 py-1.5 sm:px-3 sm:py-2">
                <Tv className="h-3.5 w-3.5 shrink-0 text-brand-tertiary sm:h-4 sm:w-4" />
                <span className="font-public-sans text-xs text-on-surface">
                  {PLACEHOLDER_SERIES_COUNT} Series
                </span>
              </div>
            </div>
          </div>
        </header>

        <ContinueWatching movies={[]} series={[]} />
      </div>
    </main>
  );
}
