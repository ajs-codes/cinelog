import type { SeriesDetails } from "@/lib/types";

type ProgressMetric = {
  colorClass: string;
  id: string | number;
  label: string;
  total: number;
  value: number;
};

export function useProgressMetrics(
  series?: SeriesDetails | null,
  seasonNumber?: number,
): ProgressMetric[] {
  const seasons = series?.seasons ?? [];
  const metrics: ProgressMetric[] = [];

  const selectedSeason = seasons.find(
    (season, index) => (season.season_number ?? index + 1) === seasonNumber,
  );

  if (selectedSeason) {
    metrics.push({
      colorClass: "bg-brand-tertiary-accent-alt",
      id: selectedSeason.id ?? seasonNumber ?? "",
      label: selectedSeason.name ?? `Season ${seasonNumber}`,
      total: selectedSeason.episode_count ?? 0,
      value: selectedSeason.episodes_watched ?? 0,
    });
  }

  if (series) {
    metrics.push({
      colorClass: "bg-brand-primary",
      id: "overall",
      label: "Series Overall Progress",
      total: series.number_of_episodes ?? 0,
      value: series.total_number_of_episodes_watched ?? 0,
    });
  }

  return metrics;
}
