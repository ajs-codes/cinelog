import { useProgressMetrics } from "@/hooks/title-details/use-progress-metrics";
import type { SeriesDetails } from "@/lib/types";

type ProgressStatusProps = {
  series?: SeriesDetails | null;
  selectedSeason?: number;
};

export function ProgressMetrics({
  series,
  selectedSeason,
}: ProgressStatusProps) {
  const metrics = useProgressMetrics(series, selectedSeason);

  return (
    <div className="space-y-5">
      {metrics.map((metric) => (
        <ProgressRow
          key={metric.id}
          label={metric.label}
          value={metric.value}
          total={metric.total}
          colorClass={metric.colorClass}
        />
      ))}
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

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressMetrics;
