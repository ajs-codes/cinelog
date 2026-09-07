export type SortKey = "relevance" | "rating" | "year";

export type SortableMovie = {
  rating?: number;
  year?: number;
};

export function sortMovies<T extends SortableMovie>(
  movies: readonly T[],
  sortKey: SortKey,
): T[] {
  if (sortKey === "relevance") {
    return [...movies];
  }

  return [...movies].sort((firstMovie, secondMovie) => {
    const firstValue = firstMovie[sortKey] ?? 0;
    const secondValue = secondMovie[sortKey] ?? 0;
    return secondValue - firstValue;
  });
}
