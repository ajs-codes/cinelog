import type { SeriesDetails } from "@/lib/types";

type ProgressStatusProps = {
  series?: SeriesDetails | null;
};

export function ProgressMetrics({ series }: ProgressStatusProps) {
  const seasons = series?.seasons ?? [];
  const totalEpisodes = series?.number_of_episodes ?? 0;

  return (
    <div className="space-y-5">
      {seasons.map((season, index) => {
        const seasonNumber = season.season_number ?? index + 1;
        const episodeCount = season.episode_count ?? 0;

        return (
          <ProgressRow
            key={season.id ?? seasonNumber}
            label={season.name ?? `Season ${seasonNumber}`}
            value={0}
            total={episodeCount}
            colorClass="bg-brand-tertiary-accent-alt"
          />
        );
      })}

      {series ? (
        <ProgressRow
          label="Series Overall Progress"
          value={0}
          total={totalEpisodes}
          colorClass="bg-brand-primary"
        />
      ) : null}
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  colorClass,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4 text-sm text-on-surface">
        <span className="font-medium text-on-surface">{label}</span>
        <span className="font-semibold text-on-surface">
          {value} / {total} Episodes ({percent}%)
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high/90">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressMetrics;
