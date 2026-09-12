"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/http/client";
import type {
  CollectionFilterItem,
  CollectionSortItem,
  CustomCollectionWithFilters,
} from "@/lib/types";

export function useCustomCollections() {
  const [collections, setCollections] = useState<CustomCollectionWithFilters[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  useEffect(() => {
    let ignore = false;

    async function loadCollections() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/collections");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setCollections(data.collections ?? data.data?.collections ?? []);
          }
        } else if (!ignore) {
          setErrorMessage("Failed to load custom collections.");
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

    void loadCollections();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleToggleLibrary(col: CustomCollectionWithFilters) {
    try {
      const nextState = !col.showInLibrary;
      const res = await apiFetch(`/api/collections/${col.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInLibrary: nextState }),
      });
      if (res.ok) {
        setCollections((prev) =>
          prev.map((item) =>
            item.id === col.id ? { ...item, showInLibrary: nextState } : item,
          ),
        );
      }
    } catch {
      setErrorMessage("Failed to toggle collection status.");
    }
  }

  async function handleQuickSortChange(
    col: CustomCollectionWithFilters,
    sortValue: string,
  ) {
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
            prev.map((item) => (item.id === col.id ? updated : item)),
          );
        }
      }
    } catch {
      setErrorMessage("Failed to update sort order.");
    }
  }

  async function saveCollection(payload: {
    name: string;
    mediaType: number;
    showInLibrary: boolean;
    filters: CollectionFilterItem[];
    sorts: CollectionSortItem[];
    editingId?: number;
  }) {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (payload.editingId) {
      const res = await apiFetch(`/api/collections/${payload.editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          mediaType: payload.mediaType,
          showInLibrary: payload.showInLibrary,
          filters: payload.filters,
          sorts: payload.sorts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update collection.");
        return false;
      }
      const updated = data.collection ?? data.data?.collection;
      if (updated) {
        setCollections((prev) =>
          prev.map((item) => (item.id === payload.editingId ? updated : item)),
        );
      }
      setSuccessMessage("Collection updated successfully.");
      return true;
    }

    const res = await apiFetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        mediaType: payload.mediaType,
        showInLibrary: payload.showInLibrary,
        filters: payload.filters,
        sorts: payload.sorts,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMessage(data.error || "Failed to create collection.");
      return false;
    }
    const created = data.collection ?? data.data?.collection;
    if (created) {
      setCollections((prev) => [created, ...prev]);
    }
    setSuccessMessage("Stream collection created successfully.");
    return true;
  }

  return {
    collections,
    isLoading,
    errorMessage,
    successMessage,
    setErrorMessage,
    setSuccessMessage,
    handleToggleLibrary,
    handleQuickSortChange,
    saveCollection,
  };
}
