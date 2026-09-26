import type { Metadata } from "next";
import { ContentPreferencesSection } from "@/components/settings/content-preferences-section";

export const metadata: Metadata = {
  title: "Content Preferences · Settings",
  description: "Customize genres, languages, and viewing preferences.",
};

export default function SettingsPreferencesPage() {
  return <ContentPreferencesSection />;
}
