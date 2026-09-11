import { AppShell } from "@/components/layout/app-shell";
import { LibraryView } from "@/components/library/library-view";

export default function LibraryMoviesPage() {
  return (
    <AppShell>
      <LibraryView mediaType="movie" />
    </AppShell>
  );
}
