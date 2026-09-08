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
): ProgressMetric[] {
  const seasons = series?.seasons ?? [];
  const metrics: ProgressMetric[] = seasons.map((season, index) => {
    const seasonNumber = season.season_number ?? index + 1;

    return {
      colorClass: "bg-brand-tertiary-accent-alt",
      id: season.id ?? seasonNumber,
      label: season.name ?? `Season ${seasonNumber}`,
      total: season.episode_count ?? 0,
      value: 0,
    };
  });

  if (series) {
    metrics.push({
      colorClass: "bg-brand-primary",
      id: "overall",
      label: "Series Overall Progress",
      total: series.number_of_episodes ?? 0,
      value: 0,
    });
  }

  return metrics;
}
