"use client";

import { AppShell } from "@/components/ui/app-shell";
import { HeroHeader } from "@/components/title-detail/hero-header";
import { TitleProgress } from "@/components/title-detail/progress";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const { id } = useParams();
  console.log("id", id);
  return (
    <AppShell>
      <main>
        <HeroHeader type="series" />
        <TitleProgress />
      </main>
    </AppShell>
  );
}
