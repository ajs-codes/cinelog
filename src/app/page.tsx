import type { Metadata } from "next";
import { HomePage } from "@/components/dashboard/home-page";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "CineLog - Dashboard",
  description: "Discover trending movies, top rated TV series, and track your cinema journey.",
};

export default function Home() {
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}
