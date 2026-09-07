export function ProgressMetrics() {
  return (
    <div className="space-y-5">
      <ProgressRow
        label="Season 1 Progress"
        value={3}
        total={10}
        colorClass="bg-brand-tertiary-accent-alt"
      />
      <ProgressRow
        label="Series Overall Progress"
        value={17}
        total={1000}
        colorClass="bg-brand-primary"
      />
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
