CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`updated_at` numeric
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` numeric DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genres_tmdb_id_unique` ON `genres` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`watch_status` integer DEFAULT 0 NOT NULL,
	`impression` integer,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`updated_at` numeric,
	`completed_at` numeric,
	`title` text NOT NULL,
	`poster_path` text,
	`release_date` text,
	`vote_average` real,
	`status` text,
	`original_language` text,
	`origin_country` text,
	`certificate` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "movies_watch_status_check" CHECK("movies"."watch_status" IN (0, 1, 2, 3)),
	CONSTRAINT "movies_impression_check" CHECK("movies"."impression" IN (0, 1, 2)),
	CONSTRAINT "movies_status_check" CHECK("movies"."status" IS NULL OR "movies"."status" IN ('rumored', 'planned', 'in_production', 'post_production', 'released', 'canceled'))
);
--> statement-breakpoint
CREATE INDEX `movies_tmdb_id_index` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`watch_status` integer DEFAULT 0 NOT NULL,
	`impression` integer,
	`updated_at` numeric,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`last_watched_at` numeric,
	`completed_at` numeric,
	`name` text NOT NULL,
	`first_air_date` text,
	`last_air_date` text,
	`total_number_of_episodes` integer,
	`total_number_of_seasons` integer,
	`total_number_of_episodes_watched` integer,
	`total_number_of_seasons_watched` integer,
	`poster_path` text,
	`vote_average` real,
	`status` text,
	`original_language` text,
	`origin_country` text,
	`certificate` text,
	`type` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "series_watch_status_check" CHECK("series"."watch_status" IN (0, 1, 2, 3)),
	CONSTRAINT "series_impression_check" CHECK("series"."impression" IN (0, 1, 2)),
	CONSTRAINT "series_status_check" CHECK("series"."status" IS NULL OR "series"."status" IN ('returning_series', 'planned', 'in_production', 'ended', 'canceled', 'pilot'))
);
--> statement-breakpoint
CREATE INDEX `series_tmdb_id_index` ON `series` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `movies_to_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`genres_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genres_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_to_genres_movie_genre_unique` ON `movies_to_genres` (`movie_id`,`genres_id`);--> statement-breakpoint
CREATE TABLE `series_to_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`series_id` integer NOT NULL,
	`genres_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genres_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_to_genres_series_genre_unique` ON `series_to_genres` (`series_id`,`genres_id`);--> statement-breakpoint
CREATE TABLE `creators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`series_id` integer NOT NULL,
	`name` text NOT NULL,
	`tmdb_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer,
	`series_id` integer,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`known_for_department` text NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "credits_exactly_one_parent_check" CHECK(("credits"."movie_id" IS NOT NULL AND "credits"."series_id" IS NULL) OR ("credits"."movie_id" IS NULL AND "credits"."series_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `credits_tmdb_id_index` ON `credits` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `credits_movie_id_index` ON `credits` (`movie_id`);--> statement-breakpoint
CREATE INDEX `credits_series_id_index` ON `credits` (`series_id`);--> statement-breakpoint
CREATE TABLE `production_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer,
	`series_id` integer,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`origin_country` text,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "production_companies_exactly_one_parent_check" CHECK(("production_companies"."movie_id" IS NOT NULL AND "production_companies"."series_id" IS NULL) OR ("production_companies"."movie_id" IS NULL AND "production_companies"."series_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `production_companies_tmdb_id_index` ON `production_companies` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `production_companies_movie_id_index` ON `production_companies` (`movie_id`);--> statement-breakpoint
CREATE INDEX `production_companies_series_id_index` ON `production_companies` (`series_id`);--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`series_id` integer NOT NULL,
	`name` text,
	`season_number` integer NOT NULL,
	`episode_count` integer NOT NULL,
	`air_date` text,
	`episodes_watched` integer DEFAULT 0 NOT NULL,
	`last_watched_at` numeric,
	`completed_at` numeric,
	`created_at` numeric NOT NULL,
	`updated_at` numeric,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "seasons_episode_count_check" CHECK("seasons"."episode_count" >= 0),
	CONSTRAINT "seasons_episodes_watched_check" CHECK("seasons"."episodes_watched" >= 0 AND "seasons"."episodes_watched" <= "seasons"."episode_count")
);
--> statement-breakpoint
CREATE INDEX `seasons_tmdb_id_index` ON `seasons` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `seasons_series_id_index` ON `seasons` (`series_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `seasons_series_season_number_unique` ON `seasons` (`series_id`,`season_number`);--> statement-breakpoint
CREATE TABLE `custom_collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`media_type` integer NOT NULL,
	`show_in_dashboard` integer DEFAULT false NOT NULL,
	`show_in_library` integer DEFAULT false NOT NULL,
	`group_by` integer,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`updated_at` numeric,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "custom_collections_group_by_check" CHECK("custom_collections"."group_by" IS NULL OR ("custom_collections"."show_in_dashboard" = 0 AND "custom_collections"."show_in_library" = 1)),
	CONSTRAINT "custom_collections_media_type_check" CHECK("custom_collections"."media_type" IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `custom_collections_user_id_index` ON `custom_collections` (`user_id`);--> statement-breakpoint
CREATE TABLE `custom_collection_filters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`custom_collection_id` integer NOT NULL,
	`field` text NOT NULL,
	`operator` integer NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`custom_collection_id`) REFERENCES `custom_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `custom_collection_filters_collection_id_index` ON `custom_collection_filters` (`custom_collection_id`);--> statement-breakpoint
CREATE TABLE `custom_collection_sorts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`custom_collection_id` integer NOT NULL,
	`field` text NOT NULL,
	`direction` integer NOT NULL,
	`priority` integer NOT NULL,
	FOREIGN KEY (`custom_collection_id`) REFERENCES `custom_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `custom_collection_sorts_collection_id_index` ON `custom_collection_sorts` (`custom_collection_id`);
