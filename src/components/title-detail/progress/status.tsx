import { ChevronDown } from "lucide-react";

export function ProgressStatus() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-surface-container-high/70 px-3.5 py-2.5 text-sm text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-tertiary-accent-alt" />
        <span className="font-medium">Watching (In Progress)</span>
        <ChevronDown className="h-4 w-4 text-outline-muted" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProgressMetadata label="SEASON" value="Season 1 of 3" />
        <ProgressMetadata label="EPISODE" value="Ep 7 of 10" />
      </div>
    </div>
  );
}

function ProgressMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-high/70 px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-secondary uppercase">
      <span className="text-outline-muted">{label}</span>
      <span className="text-on-surface">{value}</span>
    </div>
  );
}

export default ProgressStatus;
