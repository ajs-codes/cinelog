"use client";

import { Edit2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterQueryChips } from "@/components/ui/filter-query-chips";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SORT_OPTIONS } from "@/lib/constants";
import type { CustomCollectionWithFilters } from "@/lib/types";

type CollectionStreamCardProps = {
  collection: CustomCollectionWithFilters;
  index: number;
  onAddClause: () => void;
  onEdit: () => void;
  onSortChange: (sortValue: string) => void;
  onToggleLibrary: () => void;
};

export function CollectionStreamCard({
  collection,
  index,
  onAddClause,
  onEdit,
  onSortChange,
  onToggleLibrary,
}: CollectionStreamCardProps) {
  const indexStr = `#${String(index + 1).padStart(2, "0")}`;
  const primarySort = collection.sorts?.[0];
  const currentSortVal = primarySort
    ? `${primarySort.field}:${primarySort.direction}`
    : "release_date:1";

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-outline-alt/60 bg-surface-container-low p-4 transition-colors hover:border-outline-alt sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="mt-1 text-secondary/40">
          <GripVertical className="h-4 w-4 cursor-grab" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs text-outline-muted">
              {indexStr}
            </span>
            <h3 className="font-heading text-base font-semibold tracking-tight text-on-surface">
              {collection.name}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 font-public-sans text-[10px] font-semibold ${
                collection.mediaType === 0
                  ? "border border-sky-500/30 bg-sky-500/10 text-sky-400"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              {collection.mediaType === 0 ? "Movie" : "Series"}
            </span>
          </div>
          <FilterQueryChips
            filters={collection.filters}
            onAddClause={onAddClause}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
        <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-outline-alt/60 bg-surface-container px-2.5 py-1">
          <span className="font-mono text-[10px] font-semibold text-outline-muted uppercase">
            SORT:
          </span>
          <select
            className="max-w-full cursor-pointer bg-transparent font-public-sans text-xs text-on-surface outline-none"
            onChange={(event) => onSortChange(event.target.value)}
            value={currentSortVal}
          >
            {SORT_OPTIONS.map((option) => (
              <option
                className="bg-surface-container text-on-surface"
                key={`${option.field}:${option.direction}`}
                value={`${option.field}:${option.direction}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <ToggleSwitch
          checked={collection.showInLibrary}
          onChange={onToggleLibrary}
          title={
            collection.showInLibrary
              ? "Carousel is active in library"
              : "Carousel is inactive in library"
          }
        />
        <Button
          className="h-8 w-8 text-secondary hover:text-on-surface"
          onClick={onEdit}
          size="icon"
          title="Edit Stream"
          type="button"
          variant="ghost"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
