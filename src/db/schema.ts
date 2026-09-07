import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const genres = sqliteTable("genres", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tmdbId: integer("tmdb_id").notNull().unique(),
  name: text("name").notNull(),
  createdAt: numeric("created_at"),
});

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
