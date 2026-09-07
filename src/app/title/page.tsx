import { AppShell } from "@/components/ui/app-shell";
import { HeroHeader } from "@/components/title-detail/hero-header";
import { TitleProgress } from "@/components/title-detail/progress";

export default function SettingsPage() {
  return (
    <AppShell>
      <main>
        <HeroHeader />
        <TitleProgress />
      </main>
    </AppShell>
  );
}
