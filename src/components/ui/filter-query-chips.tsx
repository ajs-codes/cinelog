import { FIELD_LABELS, OPERATOR_SYMBOLS } from "@/lib/constants";
import type { CollectionFilterItem } from "@/lib/types";

export function FilterQueryChips({
  filters,
  onAddClause,
}: {
  filters: CollectionFilterItem[];
  onAddClause?: () => void;
}) {
  if (filters.length === 0 && !onAddClause) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-secondary">
      <span className="text-[10px] font-semibold tracking-wider text-outline-muted uppercase">
        Query:
      </span>
      {filters.map((filter, index) => (
        <span className="inline-flex items-center gap-1" key={index}>
          <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-on-surface">
            {FIELD_LABELS[filter.field] || filter.field}{" "}
            <span className="text-brand-primary">
              {OPERATOR_SYMBOLS[filter.operator] || "="}
            </span>{" "}
            {filter.value}
          </span>
          {index < filters.length - 1 ? (
            <span className="text-[10px] font-bold text-outline-muted">AND</span>
          ) : null}
        </span>
      ))}
      {onAddClause ? (
        <button
          className="ml-1 rounded border border-dashed border-white/20 px-2 py-0.5 text-[10px] text-brand-primary transition-colors hover:border-brand-primary hover:bg-brand-primary/10"
          onClick={onAddClause}
          type="button"
        >
          + Clause
        </button>
      ) : null}
    </div>
  );
}
