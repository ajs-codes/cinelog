import { AppShell } from "@/components/layout/app-shell";
import { LibraryView } from "../library-view";

export default function LibraryMoviesPage() {
  return (
    <AppShell>
      <LibraryView mediaType="movie" />
    </AppShell>
  );
}

