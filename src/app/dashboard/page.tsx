"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMoviesRequested } from "@/store/slices/movieSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.movies);

  useEffect(() => {
    dispatch(fetchMoviesRequested());
  }, [dispatch]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 bg-surface px-6 py-16 text-on-surface">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-secondary">
          CineLog
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Movie dashboard
        </h1>
        <p className="mt-3 text-secondary">
          Redux Toolkit and Saga are connected to the movies API.
        </p>
      </header>

      <section className="border-t border-outline-variant pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Your movies</h2>
          <span className="text-sm text-secondary">{status}</span>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-status-error">{error}</p>
        ) : null}
        {status === "loading" ? (
          <p className="mt-6 text-secondary">Loading movies...</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-secondary">No movies found yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-outline-variant border-y border-outline-variant">
            {items.map((movie) => (
              <li
                className="flex items-center justify-between py-4"
                key={movie.id}
              >
                <span className="font-medium">{movie.title}</span>
                <span className="text-sm text-secondary">
                  {movie.year ?? "Year unknown"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
