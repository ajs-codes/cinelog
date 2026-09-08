import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { movies, series } from "@/db/schema";

export async function listUserMovies(userId: number) {
  return getDb()
    .select()
    .from(movies)
    .where(eq(movies.userId, userId))
    .orderBy(desc(movies.createdAt));
}

export async function listUserSeries(userId: number) {
  return getDb()
    .select()
    .from(series)
    .where(eq(series.userId, userId))
    .orderBy(desc(series.createdAt));
}
