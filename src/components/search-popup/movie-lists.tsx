import { MovieItem } from "@/components/search-popup/movie-item";
import type {
  SearchMediaType,
  SearchResult,
  SearchStatus,
} from "@/store/slices/searchSlice";

type MovieListsProps = {
  mediaType: SearchMediaType;
  results: SearchResult[];
  status: SearchStatus;
};

export function MovieLists({ mediaType, results, status }: MovieListsProps) {
  return (
    <div className="movie-lists-scrollbar min-h-0 max-h-[calc(100dvh-12rem)] space-y-2 overflow-y-auto pr-2 sm:pr-1">
      {status === "loading" ? (
        <MovieItem state="loading" />
      ) : status === "failed" ||
        (status === "success" && results.length === 0) ? (
        <MovieItem state="failed" />
      ) : (
        results.map((result, index) => (
          <MovieItem
            genre={result.genres.join(", ")}
            key={`${mediaType}-${result.id ?? index}`}
            originalLanguage={result.original_language}
            poster={result.poster_path ?? undefined}
            rating={result.vote_average}
            synopsis={result.overview}
            title={result.title}
            year={result.release_date}
          />
        ))
      )}
    </div>
  );
}
