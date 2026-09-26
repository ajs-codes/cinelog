import type { Metadata } from "next";
import { SmartCollectionsSection } from "@/components/settings/smart-collections-section";

export const metadata: Metadata = {
  title: "Smart Collections · Settings",
  description: "Create and manage smart collections for your library.",
};

export default function SettingsCollectionsPage() {
  return <SmartCollectionsSection />;
}
