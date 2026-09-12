"use client";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CollectionFormDialog } from "@/components/settings/collection-form-dialog";
import { CollectionStreamCard } from "@/components/settings/collection-stream-card";
import { useCollectionForm } from "@/hooks/settings/use-collection-form";
import { useCustomCollections } from "@/hooks/settings/use-custom-collections";
import { Layers, Loader2, Plus } from "lucide-react";

export function CustomCollectionsSection() {
  const {
    collections,
    isLoading,
    errorMessage,
    successMessage,
    setErrorMessage,
    handleToggleLibrary,
    handleQuickSortChange,
    saveCollection,
  } = useCustomCollections();
  const form = useCollectionForm();
  const activeCount = collections.filter((item) => item.showInLibrary).length;

  return (
    <section
      aria-labelledby="custom-collections-heading"
      className="w-full space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              className="font-heading text-xl font-semibold tracking-tight text-on-surface sm:text-2xl"
              id="custom-collections-heading"
            >
              Custom Stream Collections
            </h2>
            <span className="inline-flex items-center rounded-md border border-brand-tertiary-accent/30 bg-brand-tertiary-accent/10 px-2.5 py-0.5 font-public-sans text-xs font-semibold text-brand-tertiary-accent">
              {activeCount} Active
            </span>
          </div>
          <p className="mt-1 font-public-sans text-xs text-secondary">
            Configure horizontal carousels, nested query filters, and sort
            priorities for your live library.
          </p>
        </div>
        <Button
          variant="primaryFilled"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-4 font-public-sans text-xs font-semibold"
          onClick={form.openCreateDialog}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add New Carousel Stream
        </Button>
      </div>

      {successMessage ? (
        <AlertBanner message={successMessage} variant="success" />
      ) : null}
      {errorMessage ? (
        <AlertBanner message={errorMessage} variant="error" />
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          action={
            <Button
              variant="primaryFilled"
              className="mt-1 rounded-lg px-4 py-2 font-public-sans text-xs font-semibold"
              onClick={form.openCreateDialog}
              type="button"
            >
              Create Your First Stream
            </Button>
          }
          description="Create custom filter groups based on genre, release year, language, certification, and origin country to stream dedicated carousels in your library."
          icon={<Layers className="h-6 w-6" />}
          title="No stream collections configured"
        />
      ) : (
        <div className="space-y-3">
          {collections.map((collection, index) => (
            <CollectionStreamCard
              collection={collection}
              index={index}
              key={collection.id}
              onAddClause={() => form.openEditDialog(collection, true)}
              onEdit={() => form.openEditDialog(collection, false)}
              onSortChange={(sortValue) =>
                handleQuickSortChange(collection, sortValue)
              }
              onToggleLibrary={() => handleToggleLibrary(collection)}
            />
          ))}
        </div>
      )}

      <CollectionFormDialog
        formFilters={form.formFilters}
        formMediaType={form.formMediaType}
        formName={form.formName}
        formShowInLibrary={form.formShowInLibrary}
        formSort={form.formSort}
        isEditing={Boolean(form.editingCollection)}
        isSubmitting={form.isSubmitting}
        onAddClause={form.handleAddClause}
        onMediaTypeChange={form.setFormMediaType}
        onNameChange={form.setFormName}
        onOpenChange={form.setDialogOpen}
        onRemoveClause={form.handleRemoveClause}
        onShowInLibraryChange={form.setFormShowInLibrary}
        onSortChange={form.setFormSort}
        onSubmit={(event) =>
          form.handleSaveCollection(event, saveCollection, setErrorMessage)
        }
        onUpdateClause={form.handleUpdateClause}
        open={form.dialogOpen}
      />
    </section>
  );
}
