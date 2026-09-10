import {
  check,
  integer,
  index,
  numeric,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { MOVIE_STATUS, SERIES_STATUS } from "@/lib/constants";

const movieStatusValues = sql.raw(
  Object.values(MOVIE_STATUS)
    .map((status) => `'${status.value}'`)
    .join(", "),
);
const seriesStatusValues = sql.raw(
  Object.values(SERIES_STATUS)
    .map((status) => `'${status.value}'`)
    .join(", "),
);

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  createdAt: numeric("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: numeric("updated_at"),
});

export const genres = sqliteTable("genres", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tmdbId: integer("tmdb_id").notNull().unique(),
  name: text("name").notNull(),
  createdAt: numeric("created_at").default(sql`(unixepoch())`),
});

export const movies = sqliteTable(
  "movies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tmdbId: integer("tmdb_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    watchStatus: integer("watch_status").notNull().default(0),
    impression: integer("impression"),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: numeric("updated_at"),
    completedAt: numeric("completed_at"),
    title: text("title").notNull(),
    posterPath: text("poster_path"),
    releaseDate: text("release_date"),
    voteAverage: real("vote_average"),
    status: text("status"),
    originalLanguage: text("original_language"),
    originCountry: text("origin_country"),
    certificate: text("certificate"),
  },
  (table) => [
    check(
      "movies_watch_status_check",
      sql`${table.watchStatus} IN (0, 1, 2, 3)`,
    ),
    check("movies_impression_check", sql`${table.impression} IN (0, 1, 2)`),
    check(
      "movies_status_check",
      sql`${table.status} IS NULL OR ${table.status} IN (${movieStatusValues})`,
    ),
    index("movies_tmdb_id_index").on(table.tmdbId),
    uniqueIndex("movies_user_id_tmdb_id_unique").on(table.userId, table.tmdbId),
  ],
);

export const moviesToGenres = sqliteTable(
  "movies_to_genres",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: integer("genres_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("movies_to_genres_movie_genre_unique").on(
      table.movieId,
      table.genreId,
    ),
  ],
);

export const series = sqliteTable(
  "series",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tmdbId: integer("tmdb_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    watchStatus: integer("watch_status").notNull().default(0),
    impression: integer("impression"),
    updatedAt: numeric("updated_at"),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    lastWatchedAt: numeric("last_watched_at"),
    completedAt: numeric("completed_at"),
    name: text("name").notNull(),
    firstAirDate: text("first_air_date"),
    lastAirDate: text("last_air_date"),
    totalNumberOfEpisodes: integer("total_number_of_episodes"),
    totalNumberOfSeasons: integer("total_number_of_seasons"),
    totalNumberOfEpisodesWatched: integer("total_number_of_episodes_watched"),
    totalNumberOfSeasonsWatched: integer("total_number_of_seasons_watched"),
    posterPath: text("poster_path"),
    voteAverage: real("vote_average"),
    status: text("status"),
    originalLanguage: text("original_language"),
    originCountry: text("origin_country"),
    certificate: text("certificate"),
    type: text("type"),
  },
  (table) => [
    check(
      "series_watch_status_check",
      sql`${table.watchStatus} IN (0, 1, 2, 3)`,
    ),
    check("series_impression_check", sql`${table.impression} IN (0, 1, 2)`),
    check(
      "series_status_check",
      sql`${table.status} IS NULL OR ${table.status} IN (${seriesStatusValues})`,
    ),
    index("series_tmdb_id_index").on(table.tmdbId),
    uniqueIndex("series_user_id_tmdb_id_unique").on(table.userId, table.tmdbId),
  ],
);

export const seasons = sqliteTable(
  "seasons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tmdbId: integer("tmdb_id").notNull(),
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    name: text("name"),
    seasonNumber: integer("season_number").notNull(),
    episodeCount: integer("episode_count").notNull(),
    airDate: text("air_date"),
    episodesWatched: integer("episodes_watched").notNull().default(0),
    lastWatchedAt: numeric("last_watched_at"),
    completedAt: numeric("completed_at"),
    createdAt: numeric("created_at").notNull(),
    updatedAt: numeric("updated_at"),
  },
  (table) => [
    check("seasons_episode_count_check", sql`${table.episodeCount} >= 0`),
    check(
      "seasons_episodes_watched_check",
      sql`${table.episodesWatched} >= 0 AND ${table.episodesWatched} <= ${table.episodeCount}`,
    ),
    index("seasons_tmdb_id_index").on(table.tmdbId),
    index("seasons_series_id_index").on(table.seriesId),
    uniqueIndex("seasons_series_season_number_unique").on(
      table.seriesId,
      table.seasonNumber,
    ),
  ],
);

export const seriesToGenres = sqliteTable(
  "series_to_genres",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    genreId: integer("genres_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("series_to_genres_series_genre_unique").on(
      table.seriesId,
      table.genreId,
    ),
  ],
);

export const creators = sqliteTable("creators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seriesId: integer("series_id")
    .notNull()
    .references(() => series.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  createdAt: numeric("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const credits = sqliteTable(
  "credits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    movieId: integer("movie_id").references(() => movies.id, {
      onDelete: "cascade",
    }),
    seriesId: integer("series_id").references(() => series.id, {
      onDelete: "cascade",
    }),
    tmdbId: integer("tmdb_id").notNull(),
    name: text("name").notNull(),
    knownForDepartment: text("known_for_department").notNull(),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    check(
      "credits_exactly_one_parent_check",
      sql`(${table.movieId} IS NOT NULL AND ${table.seriesId} IS NULL) OR (${table.movieId} IS NULL AND ${table.seriesId} IS NOT NULL)`,
    ),
    index("credits_tmdb_id_index").on(table.tmdbId),
    index("credits_movie_id_index").on(table.movieId),
    index("credits_series_id_index").on(table.seriesId),
  ],
);

export const productionCompanies = sqliteTable(
  "production_companies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    movieId: integer("movie_id").references(() => movies.id, {
      onDelete: "cascade",
    }),
    seriesId: integer("series_id").references(() => series.id, {
      onDelete: "cascade",
    }),
    tmdbId: integer("tmdb_id").notNull(),
    name: text("name").notNull(),
    originCountry: text("origin_country"),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    check(
      "production_companies_exactly_one_parent_check",
      sql`(${table.movieId} IS NOT NULL AND ${table.seriesId} IS NULL) OR (${table.movieId} IS NULL AND ${table.seriesId} IS NOT NULL)`,
    ),
    index("production_companies_tmdb_id_index").on(table.tmdbId),
    index("production_companies_movie_id_index").on(table.movieId),
    index("production_companies_series_id_index").on(table.seriesId),
  ],
);

export const customCollections = sqliteTable(
  "custom_collections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mediaType: integer("media_type").notNull(),
    showInDashboard: integer("show_in_dashboard", { mode: "boolean" })
      .notNull()
      .default(false),
    showInLibrary: integer("show_in_library", { mode: "boolean" })
      .notNull()
      .default(false),
    groupBy: integer("group_by"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: numeric("updated_at"),
  },
  (table) => [
    check(
      "custom_collections_group_by_check",
      sql`${table.groupBy} IS NULL OR (${table.showInDashboard} = 0 AND ${table.showInLibrary} = 1)`,
    ),
    check(
      "custom_collections_media_type_check",
      sql`${table.mediaType} IN (0, 1)`,
    ),
    index("custom_collections_user_id_index").on(table.userId),
  ],
);

export const customCollectionFilters = sqliteTable(
  "custom_collection_filters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customCollectionId: integer("custom_collection_id")
      .notNull()
      .references(() => customCollections.id, { onDelete: "cascade" }),
    field: text("field").notNull(),
    operator: integer("operator").notNull(),
    value: text("value").notNull(),
  },
  (table) => [
    index("custom_collection_filters_collection_id_index").on(
      table.customCollectionId,
    ),
  ],
);

export const customCollectionSorts = sqliteTable(
  "custom_collection_sorts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    customCollectionId: integer("custom_collection_id")
      .notNull()
      .references(() => customCollections.id, { onDelete: "cascade" }),
    field: text("field").notNull(),
    direction: integer("direction").notNull(),
    priority: integer("priority").notNull(),
  },
  (table) => [
    index("custom_collection_sorts_collection_id_index").on(
      table.customCollectionId,
    ),
  ],
);

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
export type MovieToGenre = typeof moviesToGenres.$inferSelect;
export type NewMovieToGenre = typeof moviesToGenres.$inferInsert;
export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type SeriesToGenre = typeof seriesToGenres.$inferSelect;
export type NewSeriesToGenre = typeof seriesToGenres.$inferInsert;
export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
export type Credit = typeof credits.$inferSelect;
export type NewCredit = typeof credits.$inferInsert;
export type ProductionCompany = typeof productionCompanies.$inferSelect;
export type NewProductionCompany = typeof productionCompanies.$inferInsert;
export type CustomCollection = typeof customCollections.$inferSelect;
export type NewCustomCollection = typeof customCollections.$inferInsert;
export type CustomCollectionFilter =
  typeof customCollectionFilters.$inferSelect;
export type NewCustomCollectionFilter =
  typeof customCollectionFilters.$inferInsert;
export type CustomCollectionSort = typeof customCollectionSorts.$inferSelect;
export type NewCustomCollectionSort = typeof customCollectionSorts.$inferInsert;
