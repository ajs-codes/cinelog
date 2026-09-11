import { SEARCH_YEAR_MIN, TMDB_REGIONS } from "@/lib/constants";

export type { TmdbRegion } from "@/lib/constants";

export { TMDB_REGIONS };

export function getSearchYears(now = new Date()) {
  const currentYear = now.getFullYear();
  return Array.from(
    { length: currentYear - SEARCH_YEAR_MIN + 1 },
    (_, index) => currentYear - index,
  );
}
