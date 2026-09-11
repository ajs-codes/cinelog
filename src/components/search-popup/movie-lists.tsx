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
  onItemClick?: () => void;
};

export function MovieLists({
  mediaType,
  results,
  status,
  onItemClick,
}: MovieListsProps) {
  return (
    <div className="movie-lists-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
      {status === "loading" ? (
        <MovieItem state="loading" />
      ) : status === "success" && results.length === 0 ? (
        <MovieItem state="failed" />
      ) : status === "failed" ? null : (
        results.map((result, index) => (
          <MovieItem
            genre={result.genres.join(", ")}
            id={result.id}
            isPresentInWatchlist={result.is_present_in_watchlist}
            key={`${mediaType}-${result.id ?? index}`}
            mediaType={mediaType}
            onItemClick={onItemClick}
            originalLanguage={result.original_language}
            poster={result.poster_path ?? undefined}
            rating={result.vote_average}
            synopsis={result.overview}
            title={result.title}
            watchStatus={result.watch_status}
            year={result.release_date}
          />
        ))
      )}
    </div>
  );
}
