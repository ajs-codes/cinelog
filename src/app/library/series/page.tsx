import { AppShell } from "@/components/layout/app-shell";
import { LibraryView } from "../library-view";

export default function LibrarySeriesPage() {
  return (
    <AppShell>
      <LibraryView mediaType="series" />
    </AppShell>
  );
}
