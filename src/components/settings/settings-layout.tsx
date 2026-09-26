"use client";

import type { ReactNode } from "react";
import { SettingsNav } from "@/components/settings/settings-nav";
import { SETTINGS } from "@/lib/constants/settings";

type SettingsLayoutProps = {
  children: ReactNode;
};

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const hasContent = children != null;

  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] px-3.5 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-6 sm:gap-8">
        <header className="space-y-2 border-b border-outline-alt pb-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-on-surface sm:text-4xl">
              {SETTINGS.title}
            </h1>
            <p className="mt-1 font-public-sans text-xs text-secondary sm:text-sm">
              {SETTINGS.description}
            </p>
          </div>
        </header>

        <div
          className={
            hasContent
              ? "grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10"
              : "max-w-sm"
          }
        >
          <SettingsNav />

          {hasContent ? (
            <div className="min-w-0 pt-0 lg:pt-1">{children}</div>
          ) : (
            <p className="font-public-sans text-sm text-secondary">
              {SETTINGS.landingHint}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
