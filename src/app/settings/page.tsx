"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { UserProfileSection } from "@/components/settings/user-profile-section";
import { CustomCollectionsSection } from "@/components/settings/custom-collections-section";
import { SlidersHorizontal, User } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"collections" | "profile">(
    "collections",
  );

  return (
    <AppShell>
      <main />
      <main className="relative min-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14">
          {/* Top Breadcrumb & Heading matching reference mockup */}
          <header className="space-y-2 border-b border-outline-alt/60 pb-6">
            <p className="font-mono text-xs font-semibold tracking-wider text-outline-muted uppercase">
              SETTINGS &gt; DATA ENGINE &amp; PREFERENCES
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
                  System Preferences
                </h1>
                <p className="mt-1 font-public-sans text-xs text-secondary sm:text-sm">
                  Configure live stream query pipelines, nested collection
                  filters, and account credentials.
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("collections")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-public-sans text-xs font-medium transition-colors ${
                  activeTab === "collections"
                    ? "bg-brand-primary-container/20 text-brand-primary border border-brand-primary/30"
                    : "text-secondary hover:bg-surface-container hover:text-on-surface border border-transparent"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Custom Stream Collections
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-public-sans text-xs font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-brand-primary-container/20 text-brand-primary border border-brand-primary/30"
                    : "text-secondary hover:bg-surface-container hover:text-on-surface border border-transparent"
                }`}
              >
                <User className="h-4 w-4" />
                User Profile &amp; Credentials
              </button>
            </div>
          </header>

          {/* Active Tab Content */}
          <div className="pt-2">
            {activeTab === "collections" ? (
              <CustomCollectionsSection />
            ) : (
              <UserProfileSection />
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
