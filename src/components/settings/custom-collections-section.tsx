"use client";

import { useState, useEffect, useRef } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/http/client";
import {
  COMMON_CERTS,
  COMMON_COUNTRIES,
  COMMON_GENRES,
  COMMON_LANGUAGES,
  FIELD_LABELS,
  FIELD_OPTIONS,
  OPERATOR_OPTIONS,
  OPERATOR_SYMBOLS,
  SORT_OPTIONS,
} from "@/lib/constants";
import type {
  CollectionFilterItem,
  CollectionSortItem,
  CustomCollectionWithFilters,
} from "@/lib/types";

export function CustomCollectionsSection() {
  const [collections, setCollections] = useState<CustomCollectionWithFilters[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CustomCollectionWithFilters | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formMediaType, setFormMediaType] = useState<number>(0);
  const [formShowInLibrary, setFormShowInLibrary] = useState<boolean>(true);
  const [formFilters, setFormFilters] = useState<CollectionFilterItem[]>([]);
  const [formSort, setFormSort] = useState<CollectionSortItem>({
    field: "release_date",
    direction: 1,
    priority: 0,
  });
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    let ignore = false;

    async function loadCollections() {
      try {
        const res = await fetch("/api/collections");
        if (res.ok && !ignore) {
          const data = await res.json();
          setCollections(data.collections ?? data.data?.collections ?? []);
        }
      } catch {
        if (!ignore) {
          setErrorMessage("Failed to load custom collections.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCollections();

    return () => {
      ignore = true;
    };
  }, []);

  const openCreateDialog = () => {
    setEditingCollection(null);
    setFormName("");
    setFormMediaType(0);
    setFormShowInLibrary(true);
    setFormFilters([
      {
        field: "genre",
        operator: 0,
        value: "Action",
      },
    ]);
    setFormSort({
      field: "release_date",
      direction: 1,
      priority: 0,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (
    col: CustomCollectionWithFilters,
    addClause = false,
  ) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormMediaType(col.mediaType);
    setFormShowInLibrary(col.showInLibrary);
    const filters = col.filters.length > 0 ? [...col.filters] : [];
    if (addClause) {
      filters.push({
        field: "release_year",
        operator: 2,
        value: "2020",
      });
    }
    setFormFilters(filters);
    if (col.sorts && col.sorts.length > 0) {
      setFormSort({
        field: col.sorts[0].field,
        direction: col.sorts[0].direction,
        priority: 0,
      });
    } else {
      setFormSort({
        field: "release_date",
        direction: 1,
        priority: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleAddClause = () => {
    setFormFilters((prev) => [
      ...prev,
      {
        field: "genre",
        operator: 0,
        value: "Action",
      },
    ]);
  };

  const handleRemoveClause = (index: number) => {
    setFormFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateClause = (
    index: number,
    field: keyof CollectionFilterItem,
    value: string | number,
  ) => {
    setFormFilters((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const handleToggleLibrary = async (col: CustomCollectionWithFilters) => {
    try {
      const nextState = !col.showInLibrary;
      const res = await apiFetch(`/api/collections/${col.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInLibrary: nextState }),
      });
      if (res.ok) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === col.id ? { ...c, showInLibrary: nextState } : c,
          ),
        );
      }
    } catch {
      setErrorMessage("Failed to toggle collection status.");
    }
  };

  const handleQuickSortChange = async (
    col: CustomCollectionWithFilters,
    sortValue: string,
  ) => {
    try {
      const [field, dirStr] = sortValue.split(":");
      const direction = parseInt(dirStr, 10);
      const res = await apiFetch(`/api/collections/${col.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sorts: [{ field, direction, priority: 0 }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.collection ?? data.data?.collection;
        if (updated) {
          setCollections((prev) =>
            prev.map((c) => (c.id === col.id ? updated : c)),
          );
        }
      }
    } catch {
      setErrorMessage("Failed to update sort order.");
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formName.trim()) {
      setErrorMessage("Collection name is required.");
      return;
    }

    if (formFilters.length === 0) {
      setErrorMessage("At least one filter clause is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formName.trim(),
        mediaType: formMediaType,
        showInLibrary: formShowInLibrary,
        filters: formFilters.map((f) => ({
          field: f.field,
          operator: f.operator,
          value: f.value.trim(),
        })),
        sorts: [formSort],
      };

      if (editingCollection) {
        const res = await apiFetch(`/api/collections/${editingCollection.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Failed to update collection.");
          return;
        }
        const updated = data.collection ?? data.data?.collection;
        if (updated) {
          setCollections((prev) =>
            prev.map((c) => (c.id === editingCollection.id ? updated : c)),
          );
        }
        setSuccessMessage("Collection updated successfully.");
      } else {
        const res = await apiFetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Failed to create collection.");
          return;
        }
        const created = data.collection ?? data.data?.collection;
        if (created) {
          setCollections((prev) => [created, ...prev]);
        }
        setSuccessMessage("Stream collection created successfully.");
      }

      setDialogOpen(false);
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = collections.filter((c) => c.showInLibrary).length;

  return (
    <section
      aria-labelledby="custom-collections-heading"
      className="w-full space-y-6"
    >
      {/* Header matching user reference image */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2
              id="custom-collections-heading"
              className="font-heading text-xl font-semibold tracking-tight text-on-surface sm:text-2xl"
            >
              Custom Stream Collections
            </h2>
            <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-public-sans text-xs font-semibold text-amber-400">
              {activeCount} Active
            </span>
          </div>
          <p className="mt-1 font-public-sans text-xs text-secondary">
            Configure horizontal carousels, nested query filters, and sort
            priorities for your live library.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-surface-container-high px-4 font-public-sans text-xs font-medium text-on-surface transition-colors hover:bg-surface-container hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Add New Carousel Stream
        </Button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 font-public-sans text-xs text-status-success">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3 font-public-sans text-xs text-status-error">
          {errorMessage}
        </div>
      )}

      {/* Stream Cards List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-secondary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface-container-low px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-secondary">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-heading text-base font-medium text-on-surface">
            No stream collections configured
          </h3>
          <p className="mt-1 max-w-sm font-public-sans text-xs text-secondary">
            Create custom filter groups based on genre, release year, language,
            certification, and origin country to stream dedicated carousels in
            your library.
          </p>
          <Button
            type="button"
            onClick={openCreateDialog}
            className="mt-5 rounded-lg bg-brand-primary px-4 py-2 font-public-sans text-xs text-surface hover:bg-brand-primary/90"
          >
            Create Your First Stream
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((col, index) => {
            const indexStr = `#${String(index + 1).padStart(2, "0")}`;
            const primarySort = col.sorts?.[0];
            const currentSortVal = primarySort
              ? `${primarySort.field}:${primarySort.direction}`
              : "release_date:1";

            return (
              <div
                key={col.id}
                className="group relative flex flex-col gap-4 rounded-xl border border-outline-alt/60 bg-surface-container-low p-4 transition-colors hover:border-outline-alt sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                {/* Left side: Grip, Index, Title, Badges, Queries */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-1 text-secondary/40">
                    <GripVertical className="h-4 w-4 cursor-grab" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs text-outline-muted">
                        {indexStr}
                      </span>
                      <h3 className="font-heading text-base font-semibold tracking-tight text-on-surface">
                        {col.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-public-sans text-[10px] font-semibold ${
                          col.mediaType === 0
                            ? "border border-sky-500/30 bg-sky-500/10 text-sky-400"
                            : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {col.mediaType === 0 ? "Movie" : "Series"}
                      </span>
                    </div>

                    {/* QUERY Pipeline with interactive chips */}
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-secondary">
                      <span className="text-[10px] font-semibold tracking-wider text-outline-muted uppercase">
                        QUERY:
                      </span>
                      {col.filters.map((filter, fIdx) => (
                        <div
                          key={fIdx}
                          className="inline-flex items-center gap-1.5"
                        >
                          <span className="rounded border border-white/5 bg-surface-container px-2 py-0.5 text-on-surface">
                            {FIELD_LABELS[filter.field] || filter.field}{" "}
                            <span className="text-brand-primary">
                              {OPERATOR_SYMBOLS[filter.operator] || "="}
                            </span>{" "}
                            {filter.value}
                          </span>
                          {fIdx < col.filters.length - 1 && (
                            <span className="font-bold text-outline-muted">
                              AND
                            </span>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => openEditDialog(col, true)}
                        className="ml-1 rounded border border-dashed border-white/20 px-2 py-0.5 text-[10px] text-brand-primary transition-colors hover:border-brand-primary hover:bg-brand-primary/10"
                      >
                        + Clause
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side controls: SORT selector, Active toggle switch, Edit */}
                <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
                  {/* SORT Dropdown */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-outline-alt/60 bg-surface-container px-2.5 py-1">
                    <span className="font-mono text-[10px] font-semibold text-outline-muted uppercase">
                      SORT:
                    </span>
                    <select
                      value={currentSortVal}
                      onChange={(e) =>
                        handleQuickSortChange(col, e.target.value)
                      }
                      className="cursor-pointer bg-transparent font-public-sans text-xs text-on-surface outline-none"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option
                          key={`${opt.field}:${opt.direction}`}
                          value={`${opt.field}:${opt.direction}`}
                          className="bg-surface-container text-on-surface"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={col.showInLibrary}
                    onClick={() => handleToggleLibrary(col)}
                    title={
                      col.showInLibrary
                        ? "Carousel is active in library"
                        : "Carousel is inactive in library"
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      col.showInLibrary
                        ? "bg-brand-primary"
                        : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        col.showInLibrary ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  {/* Edit action */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(col, false)}
                    className="h-8 w-8 text-secondary hover:text-on-surface"
                    title="Edit Stream"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Collection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-[calc(100%-1.5rem)] sm:max-w-2xl overflow-y-auto border-outline-alt bg-surface-container-low p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-on-surface">
              {editingCollection
                ? "Edit Carousel Stream"
                : "New Carousel Stream"}
            </DialogTitle>
            <DialogDescription className="text-secondary">
              Configure your nested filter clauses and sorting rules for this
              library carousel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCollection} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-public-sans text-xs font-medium text-on-surface">
                  Stream Title
                </label>
                <Input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 90s Sci-Fi Classics, Anime Masterpieces"
                  className="border-outline-alt bg-surface-container"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-public-sans text-xs font-medium text-on-surface">
                  Media Type
                </label>
                <select
                  value={formMediaType}
                  onChange={(e) => setFormMediaType(Number(e.target.value))}
                  className="h-8 w-full rounded-lg border border-outline-alt bg-surface-container px-2.5 font-public-sans text-xs text-on-surface outline-none"
                >
                  <option value={0}>Movies</option>
                  <option value={1}>Series</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-public-sans text-xs font-medium text-on-surface">
                  Sort Priority
                </label>
                <select
                  value={`${formSort.field}:${formSort.direction}`}
                  onChange={(e) => {
                    const [field, dirStr] = e.target.value.split(":");
                    setFormSort({
                      field,
                      direction: parseInt(dirStr, 10),
                      priority: 0,
                    });
                  }}
                  className="h-8 w-full rounded-lg border border-outline-alt bg-surface-container px-2.5 font-public-sans text-xs text-on-surface outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option
                      key={`${opt.field}:${opt.direction}`}
                      value={`${opt.field}:${opt.direction}`}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Clauses Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-public-sans text-xs font-medium text-on-surface">
                  Query Filter Clauses (AND Logic)
                </label>
                <button
                  type="button"
                  onClick={handleAddClause}
                  className="inline-flex items-center gap-1 font-public-sans text-xs font-semibold text-brand-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Clause
                </button>
              </div>

              <div className="space-y-2.5">
                {formFilters.map((clause, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-alt/60 bg-surface-container p-2.5 sm:flex-nowrap"
                  >
                    <span className="font-mono text-[11px] font-semibold text-outline-muted sm:w-6">
                      #{idx + 1}
                    </span>

                    {/* Field select */}
                    <select
                      value={clause.field}
                      onChange={(e) =>
                        handleUpdateClause(idx, "field", e.target.value)
                      }
                      className="h-8 w-full sm:w-32 rounded border border-outline-alt bg-surface-container-high px-2 font-public-sans text-xs text-on-surface outline-none"
                    >
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    {/* Operator select */}
                    <select
                      value={clause.operator}
                      onChange={(e) =>
                        handleUpdateClause(
                          idx,
                          "operator",
                          Number(e.target.value),
                        )
                      }
                      className="h-8 w-full sm:w-20 rounded border border-outline-alt bg-surface-container-high px-2 font-mono text-xs text-on-surface outline-none"
                    >
                      {OPERATOR_OPTIONS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    {/* Value Input with Preset helpers */}
                    <div className="w-full min-w-0 sm:flex-1">
                      {clause.field === "genre" ? (
                        <select
                          value={clause.value}
                          onChange={(e) =>
                            handleUpdateClause(idx, "value", e.target.value)
                          }
                          className="h-8 w-full rounded border border-outline-alt bg-surface-container-high px-2 font-public-sans text-xs text-on-surface outline-none"
                        >
                          {COMMON_GENRES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      ) : clause.field === "original_language" ? (
                        <select
                          value={clause.value}
                          onChange={(e) =>
                            handleUpdateClause(idx, "value", e.target.value)
                          }
                          className="h-8 w-full rounded border border-outline-alt bg-surface-container-high px-2 font-public-sans text-xs text-on-surface outline-none"
                        >
                          {COMMON_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.label} ({l.code})
                            </option>
                          ))}
                        </select>
                      ) : clause.field === "origin_country" ? (
                        <select
                          value={clause.value}
                          onChange={(e) =>
                            handleUpdateClause(idx, "value", e.target.value)
                          }
                          className="h-8 w-full rounded border border-outline-alt bg-surface-container-high px-2 font-public-sans text-xs text-on-surface outline-none"
                        >
                          {COMMON_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label} ({c.code})
                            </option>
                          ))}
                        </select>
                      ) : clause.field === "certification" ? (
                        <select
                          value={clause.value}
                          onChange={(e) =>
                            handleUpdateClause(idx, "value", e.target.value)
                          }
                          className="h-8 w-full rounded border border-outline-alt bg-surface-container-high px-2 font-public-sans text-xs text-on-surface outline-none"
                        >
                          {COMMON_CERTS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          type="text"
                          value={clause.value}
                          onChange={(e) =>
                            handleUpdateClause(idx, "value", e.target.value)
                          }
                          placeholder="e.g. 2020"
                          className="h-8 border-outline-alt bg-surface-container-high text-xs"
                          required
                        />
                      )}
                    </div>

                    {/* Delete clause button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={formFilters.length <= 1}
                      onClick={() => handleRemoveClause(idx)}
                      className="h-8 w-8 ml-auto sm:ml-0 text-secondary hover:text-status-error disabled:opacity-30 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Show in Library Checkbox */}
            <div className="flex items-center gap-2.5">
              <input
                id="show-library-checkbox"
                type="checkbox"
                checked={formShowInLibrary}
                onChange={(e) => setFormShowInLibrary(e.target.checked)}
                className="size-4 rounded border-outline-alt text-brand-primary focus:ring-brand-primary"
              />
              <label
                htmlFor="show-library-checkbox"
                className="font-public-sans text-xs text-on-surface"
              >
                Enable horizontal carousel display in My Library
              </label>
            </div>

            <DialogFooter className="border-t border-outline-alt/60">
              <Button
                type="button"
                variant="darkFilled"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-surface hover:bg-brand-primary/90"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : editingCollection ? (
                  "Save Changes"
                ) : (
                  "Create Stream"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
