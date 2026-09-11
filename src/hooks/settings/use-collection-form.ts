"use client";

import { useState, type FormEvent } from "react";
import type {
  CollectionFilterItem,
  CollectionSortItem,
  CustomCollectionWithFilters,
} from "@/lib/types";

const defaultFilter = (): CollectionFilterItem => ({
  field: "genre",
  operator: 0,
  value: "Action",
});

const defaultSort = (): CollectionSortItem => ({
  field: "release_date",
  direction: 1,
  priority: 0,
});

export function useCollectionForm() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CustomCollectionWithFilters | null>(null);
  const [formName, setFormName] = useState("");
  const [formMediaType, setFormMediaType] = useState(0);
  const [formShowInLibrary, setFormShowInLibrary] = useState(true);
  const [formFilters, setFormFilters] = useState<CollectionFilterItem[]>([]);
  const [formSort, setFormSort] = useState<CollectionSortItem>(defaultSort());

  function openCreateDialog() {
    setEditingCollection(null);
    setFormName("");
    setFormMediaType(0);
    setFormShowInLibrary(true);
    setFormFilters([defaultFilter()]);
    setFormSort(defaultSort());
    setDialogOpen(true);
  }

  function openEditDialog(
    collection: CustomCollectionWithFilters,
    addClause = false,
  ) {
    setEditingCollection(collection);
    setFormName(collection.name);
    setFormMediaType(collection.mediaType);
    setFormShowInLibrary(collection.showInLibrary);
    const filters =
      collection.filters.length > 0 ? [...collection.filters] : [];
    if (addClause) {
      filters.push({
        field: "release_year",
        operator: 2,
        value: "2020",
      });
    }
    setFormFilters(filters);
    if (collection.sorts && collection.sorts.length > 0) {
      setFormSort({
        field: collection.sorts[0].field,
        direction: collection.sorts[0].direction,
        priority: 0,
      });
    } else {
      setFormSort(defaultSort());
    }
    setDialogOpen(true);
  }

  function handleAddClause() {
    setFormFilters((prev) => [...prev, defaultFilter()]);
  }

  function handleRemoveClause(index: number) {
    setFormFilters((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpdateClause(
    index: number,
    field: keyof CollectionFilterItem,
    value: string | number,
  ) {
    setFormFilters((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  async function handleSaveCollection(
    event: FormEvent,
    onSave: (payload: {
      name: string;
      mediaType: number;
      showInLibrary: boolean;
      filters: CollectionFilterItem[];
      sorts: CollectionSortItem[];
      editingId?: number;
    }) => Promise<boolean>,
    onError: (message: string) => void,
  ) {
    event.preventDefault();

    if (!formName.trim()) {
      onError("Collection name is required.");
      return;
    }

    if (formFilters.length === 0) {
      onError("At least one filter clause is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await onSave({
        name: formName.trim(),
        mediaType: formMediaType,
        showInLibrary: formShowInLibrary,
        filters: formFilters.map((filter) => ({
          field: filter.field,
          operator: filter.operator,
          value: filter.value.trim(),
        })),
        sorts: [formSort],
        editingId: editingCollection?.id,
      });
      if (saved) {
        setDialogOpen(false);
      }
    } catch {
      onError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    dialogOpen,
    setDialogOpen,
    isSubmitting,
    editingCollection,
    formName,
    setFormName,
    formMediaType,
    setFormMediaType,
    formShowInLibrary,
    setFormShowInLibrary,
    formFilters,
    formSort,
    setFormSort,
    openCreateDialog,
    openEditDialog,
    handleAddClause,
    handleRemoveClause,
    handleUpdateClause,
    handleSaveCollection,
  };
}
