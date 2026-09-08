import type { SeriesDetails } from "@/lib/types";

export function useProgressStatus(series?: SeriesDetails | null) {
  return {
    episodeCount: series?.number_of_episodes ?? 10,
    seasonCount: series?.number_of_seasons ?? 3,
  };
}
