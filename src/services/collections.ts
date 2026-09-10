import { AppError } from "@/lib/http/errors";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/validations/collections";
import {
  findUserCollectionById,
  insertUserCollection,
  listUserCollections,
  updateUserCollection as repoUpdateCollection,
} from "@/repositories/collections";

export async function getUserCollections(userId: number) {
  return listUserCollections(userId);
}

export async function getUserCollection(id: number, userId: number) {
  const collection = await findUserCollectionById(id, userId);
  if (!collection) {
    throw new AppError("Collection not found", 404);
  }
  return collection;
}

export async function createUserCollection(
  userId: number,
  input: CreateCollectionInput,
) {
  return insertUserCollection(userId, input);
}

export async function updateUserCollection(
  id: number,
  userId: number,
  input: UpdateCollectionInput,
) {
  const updated = await repoUpdateCollection(id, userId, input);
  if (!updated) {
    throw new AppError("Collection not found", 404);
  }
  return updated;
}
