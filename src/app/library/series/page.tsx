import { AppShell } from "@/components/layout/app-shell";
import { LibraryView } from "@/components/library/library-view";

export default function LibrarySeriesPage() {
  return (
    <AppShell>
      <LibraryView mediaType="series" />
    </AppShell>
  );
}
