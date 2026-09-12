"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { FilterClauseRow } from "@/components/settings/filter-clause-row";
import { SORT_OPTIONS } from "@/lib/constants";
import type { CollectionFilterItem, CollectionSortItem } from "@/lib/types";
import { Loader2, Plus } from "lucide-react";
import type { FormEvent } from "react";

type CollectionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  formName: string;
  formMediaType: number;
  formShowInLibrary: boolean;
  formFilters: CollectionFilterItem[];
  formSort: CollectionSortItem;
  onNameChange: (value: string) => void;
  onMediaTypeChange: (value: number) => void;
  onShowInLibraryChange: (value: boolean) => void;
  onSortChange: (sort: CollectionSortItem) => void;
  onAddClause: () => void;
  onRemoveClause: (index: number) => void;
  onUpdateClause: (
    index: number,
    field: keyof CollectionFilterItem,
    value: string | number,
  ) => void;
  onSubmit: (event: FormEvent) => void;
};

export function CollectionFormDialog({
  open,
  onOpenChange,
  isEditing,
  isSubmitting,
  formName,
  formMediaType,
  formShowInLibrary,
  formFilters,
  formSort,
  onNameChange,
  onMediaTypeChange,
  onShowInLibraryChange,
  onSortChange,
  onAddClause,
  onRemoveClause,
  onUpdateClause,
  onSubmit,
}: CollectionFormDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] max-w-[calc(100%-1.5rem)] overflow-y-auto border-outline-alt bg-surface-container-low p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-on-surface">
            {isEditing ? "Edit Carousel Stream" : "New Carousel Stream"}
          </DialogTitle>
          <DialogDescription className="text-secondary">
            Configure your nested filter clauses and sorting rules for this
            library carousel.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6 pt-2" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              className="sm:col-span-2"
              id="stream-title"
              label="Stream Title"
            >
              <Input
                className="border-outline-alt bg-surface-container"
                id="stream-title"
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="e.g. 90s Sci-Fi Classics, Anime Masterpieces"
                required
                type="text"
                value={formName}
              />
            </FormField>
            <FormField id="stream-media-type" label="Media Type">
              <select
                className="h-8 w-full rounded-lg border border-outline-alt bg-surface-container px-2.5 font-public-sans text-xs text-on-surface outline-none"
                id="stream-media-type"
                onChange={(event) =>
                  onMediaTypeChange(Number(event.target.value))
                }
                value={formMediaType}
              >
                <option value={0}>Movies</option>
                <option value={1}>Series</option>
              </select>
            </FormField>
            <FormField id="stream-sort" label="Sort Priority">
              <select
                className="h-8 w-full rounded-lg border border-outline-alt bg-surface-container px-2.5 font-public-sans text-xs text-on-surface outline-none"
                id="stream-sort"
                onChange={(event) => {
                  const [field, dirStr] = event.target.value.split(":");
                  onSortChange({
                    field,
                    direction: parseInt(dirStr, 10),
                    priority: 0,
                  });
                }}
                value={`${formSort.field}:${formSort.direction}`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={`${option.field}:${option.direction}`}
                    value={`${option.field}:${option.direction}`}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-public-sans text-xs font-medium text-on-surface">
                Query Filter Clauses (AND Logic)
              </label>
              <button
                className="inline-flex min-h-8 items-center gap-1 font-public-sans text-xs font-semibold text-brand-primary hover:underline"
                onClick={onAddClause}
                type="button"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Clause
              </button>
            </div>
            <div className="space-y-2.5">
              {formFilters.map((clause, index) => (
                <FilterClauseRow
                  canRemove={formFilters.length > 1}
                  clause={clause}
                  index={index}
                  key={index}
                  onRemove={() => onRemoveClause(index)}
                  onUpdate={(field, value) =>
                    onUpdateClause(index, field, value)
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              checked={formShowInLibrary}
              className="size-4 rounded border-outline-alt text-brand-primary focus:ring-brand-primary"
              id="show-library-checkbox"
              onChange={(event) => onShowInLibraryChange(event.target.checked)}
              type="checkbox"
            />
            <label
              className="font-public-sans text-xs text-on-surface"
              htmlFor="show-library-checkbox"
            >
              Enable horizontal carousel display in My Library
            </label>
          </div>

          <DialogFooter className="border-t border-outline-alt/60">
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="darkFilled"
            >
              Cancel
            </Button>
            <Button
              variant="primaryFilled"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Stream"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
