import type { Metadata } from "next";
import { MoviePage } from "@/components/content-detail/movie-page";
import { AppShell } from "@/components/layout/app-shell";
import { getMovieDetails } from "@/services/movies";

type MovieRoutePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: MovieRoutePageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    return {
      title: "Movie Details",
      description: "Movie details and cast on CineLog",
    };
  }

  try {
    const movie = await getMovieDetails(movieId);
    const movieTitle = movie.title || "Movie Details";
    const releaseYear = movie.release_date
      ? ` (${new Date(movie.release_date).getFullYear()})`
      : "";

    return {
      title: `${movieTitle}${releaseYear}`,
      description:
        movie.overview ||
        `View details, cast, rating and track ${movieTitle} on CineLog.`,
      openGraph: {
        title: `CineLog - ${movieTitle}${releaseYear}`,
        description: movie.overview || undefined,
        images: movie.poster_path
          ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
          : [],
      },
    };
  } catch {
    return {
      title: "CineLog - Movie Details",
      description: "Movie details and cast on CineLog",
    };
  }
}

export default function MovieRoutePage() {
  return (
    <AppShell>
      <MoviePage />
    </AppShell>
  );
}
