import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  customCollectionFilters,
  customCollections,
  customCollectionSorts,
} from "@/db/schema";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/validations/collections";
import type { CustomCollectionWithFilters } from "@/lib/types";

export async function listUserCollections(
  userId: number,
): Promise<CustomCollectionWithFilters[]> {
  const db = getDb();
  const collections = await db
    .select()
    .from(customCollections)
    .where(eq(customCollections.userId, userId))
    .orderBy(asc(customCollections.displayOrder), desc(customCollections.createdAt));

  if (collections.length === 0) {
    return [];
  }

  const collectionIds = collections.map((c) => c.id);

  const [filters, sorts] = await Promise.all([
    db
      .select()
      .from(customCollectionFilters)
      .where(inArray(customCollectionFilters.customCollectionId, collectionIds)),
    db
      .select()
      .from(customCollectionSorts)
      .where(inArray(customCollectionSorts.customCollectionId, collectionIds))
      .orderBy(asc(customCollectionSorts.priority)),
  ]);

  return collections.map((col) => ({
    id: col.id,
    userId: col.userId,
    name: col.name,
    mediaType: col.mediaType,
    showInDashboard: col.showInDashboard,
    showInLibrary: col.showInLibrary,
    groupBy: col.groupBy,
    displayOrder: col.displayOrder,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
    filters: filters
      .filter((f) => f.customCollectionId === col.id)
      .map((f) => ({
        id: f.id,
        customCollectionId: f.customCollectionId,
        field: f.field,
        operator: f.operator,
        value: f.value,
      })),
    sorts: sorts
      .filter((s) => s.customCollectionId === col.id)
      .map((s) => ({
        id: s.id,
        customCollectionId: s.customCollectionId,
        field: s.field,
        direction: s.direction,
        priority: s.priority,
      })),
  }));
}

export async function findUserCollectionById(
  id: number,
  userId: number,
): Promise<CustomCollectionWithFilters | null> {
  const db = getDb();
  const collection = await db
    .select()
    .from(customCollections)
    .where(and(eq(customCollections.id, id), eq(customCollections.userId, userId)))
    .get();

  if (!collection) return null;

  const [filters, sorts] = await Promise.all([
    db
      .select()
      .from(customCollectionFilters)
      .where(eq(customCollectionFilters.customCollectionId, id)),
    db
      .select()
      .from(customCollectionSorts)
      .where(eq(customCollectionSorts.customCollectionId, id))
      .orderBy(asc(customCollectionSorts.priority)),
  ]);

  return {
    id: collection.id,
    userId: collection.userId,
    name: collection.name,
    mediaType: collection.mediaType,
    showInDashboard: collection.showInDashboard,
    showInLibrary: collection.showInLibrary,
    groupBy: collection.groupBy,
    displayOrder: collection.displayOrder,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    filters: filters.map((f) => ({
      id: f.id,
      customCollectionId: f.customCollectionId,
      field: f.field,
      operator: f.operator,
      value: f.value,
    })),
    sorts: sorts.map((s) => ({
      id: s.id,
      customCollectionId: s.customCollectionId,
      field: s.field,
      direction: s.direction,
      priority: s.priority,
    })),
  };
}

export async function insertUserCollection(
  userId: number,
  data: CreateCollectionInput,
): Promise<CustomCollectionWithFilters> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [collection] = await tx
      .insert(customCollections)
      .values({
        userId,
        name: data.name,
        mediaType: data.mediaType,
        showInDashboard: data.showInDashboard,
        showInLibrary: data.showInLibrary,
        groupBy: data.groupBy ?? null,
        displayOrder: data.displayOrder,
      })
      .returning();

    const createdFilters = [];
    for (const filter of data.filters) {
      const [created] = await tx
        .insert(customCollectionFilters)
        .values({
          customCollectionId: collection.id,
          field: filter.field,
          operator: filter.operator,
          value: filter.value,
        })
        .returning();
      createdFilters.push({
        id: created.id,
        customCollectionId: created.customCollectionId,
        field: created.field,
        operator: created.operator,
        value: created.value,
      });
    }

    const createdSorts = [];
    if (data.sorts && data.sorts.length > 0) {
      for (let i = 0; i < data.sorts.length; i++) {
        const sort = data.sorts[i];
        const [created] = await tx
          .insert(customCollectionSorts)
          .values({
            customCollectionId: collection.id,
            field: sort.field,
            direction: sort.direction,
            priority: sort.priority ?? i,
          })
          .returning();
        createdSorts.push({
          id: created.id,
          customCollectionId: created.customCollectionId,
          field: created.field,
          direction: created.direction,
          priority: created.priority,
        });
      }
    }

    return {
      id: collection.id,
      userId: collection.userId,
      name: collection.name,
      mediaType: collection.mediaType,
      showInDashboard: collection.showInDashboard,
      showInLibrary: collection.showInLibrary,
      groupBy: collection.groupBy,
      displayOrder: collection.displayOrder,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      filters: createdFilters,
      sorts: createdSorts,
    };
  });
}

export async function updateUserCollection(
  id: number,
  userId: number,
  data: UpdateCollectionInput,
): Promise<CustomCollectionWithFilters | null> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(customCollections)
      .where(and(eq(customCollections.id, id), eq(customCollections.userId, userId)))
      .get();

    if (!existing) return null;

    const updates: Partial<typeof customCollections.$inferInsert> = {
      updatedAt: String(Math.floor(Date.now() / 1000)),
    };

    if (data.name !== undefined) updates.name = data.name;
    if (data.mediaType !== undefined) updates.mediaType = data.mediaType;
    if (data.showInDashboard !== undefined)
      updates.showInDashboard = data.showInDashboard;
    if (data.showInLibrary !== undefined)
      updates.showInLibrary = data.showInLibrary;
    if (data.groupBy !== undefined) updates.groupBy = data.groupBy;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;

    const [updated] = await tx
      .update(customCollections)
      .set(updates)
      .where(and(eq(customCollections.id, id), eq(customCollections.userId, userId)))
      .returning();

    let finalFilters = [];
    if (data.filters !== undefined) {
      await tx
        .delete(customCollectionFilters)
        .where(eq(customCollectionFilters.customCollectionId, id));

      for (const filter of data.filters) {
        const [created] = await tx
          .insert(customCollectionFilters)
          .values({
            customCollectionId: id,
            field: filter.field,
            operator: filter.operator,
            value: filter.value,
          })
          .returning();
        finalFilters.push({
          id: created.id,
          customCollectionId: created.customCollectionId,
          field: created.field,
          operator: created.operator,
          value: created.value,
        });
      }
    } else {
      const existingFilters = await tx
        .select()
        .from(customCollectionFilters)
        .where(eq(customCollectionFilters.customCollectionId, id));
      finalFilters = existingFilters.map((f) => ({
        id: f.id,
        customCollectionId: f.customCollectionId,
        field: f.field,
        operator: f.operator,
        value: f.value,
      }));
    }

    let finalSorts = [];
    if (data.sorts !== undefined) {
      await tx
        .delete(customCollectionSorts)
        .where(eq(customCollectionSorts.customCollectionId, id));

      for (let i = 0; i < data.sorts.length; i++) {
        const sort = data.sorts[i];
        const [created] = await tx
          .insert(customCollectionSorts)
          .values({
            customCollectionId: id,
            field: sort.field,
            direction: sort.direction,
            priority: sort.priority ?? i,
          })
          .returning();
        finalSorts.push({
          id: created.id,
          customCollectionId: created.customCollectionId,
          field: created.field,
          direction: created.direction,
          priority: created.priority,
        });
      }
    } else {
      const existingSorts = await tx
        .select()
        .from(customCollectionSorts)
        .where(eq(customCollectionSorts.customCollectionId, id))
        .orderBy(asc(customCollectionSorts.priority));
      finalSorts = existingSorts.map((s) => ({
        id: s.id,
        customCollectionId: s.customCollectionId,
        field: s.field,
        direction: s.direction,
        priority: s.priority,
      }));
    }

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      mediaType: updated.mediaType,
      showInDashboard: updated.showInDashboard,
      showInLibrary: updated.showInLibrary,
      groupBy: updated.groupBy,
      displayOrder: updated.displayOrder,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      filters: finalFilters,
      sorts: finalSorts,
    };
  });
}

export async function deleteUserCollection(id: number, userId: number) {
  const db = getDb();
  return db
    .delete(customCollections)
    .where(and(eq(customCollections.id, id), eq(customCollections.userId, userId)))
    .returning();
}

