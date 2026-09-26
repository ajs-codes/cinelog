import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsLayout } from "@/components/settings/settings-layout";
import { SETTINGS } from "@/lib/constants/settings";

export const metadata: Metadata = {
  title: SETTINGS.title,
  description: SETTINGS.description,
};

export default function SettingsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <SettingsLayout>{children}</SettingsLayout>
    </AppShell>
  );
}
