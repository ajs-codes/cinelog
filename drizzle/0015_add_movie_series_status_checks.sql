PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movies` (
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
	`vote_average` integer,
	`status` text,
	`original_language` text,
	`origin_country` text,
	`certificate` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "movies_watch_status_check" CHECK("__new_movies"."watch_status" IN (0, 1, 2, 3)),
	CONSTRAINT "movies_impression_check" CHECK("__new_movies"."impression" IN (0, 1, 2)),
	CONSTRAINT "movies_status_check" CHECK("__new_movies"."status" IS NULL OR "__new_movies"."status" IN ('rumored', 'planned', 'in_production', 'post_production', 'released', 'canceled'))
);
--> statement-breakpoint
INSERT INTO `__new_movies`("id", "tmdb_id", "user_id", "watch_status", "impression", "created_at", "updated_at", "completed_at", "title", "poster_path", "release_date", "vote_average", "status", "original_language", "origin_country", "certificate") SELECT "id", "tmdb_id", "user_id", "watch_status", "impression", "created_at", "updated_at", "completed_at", "title", "poster_path", "release_date", "vote_average", CASE lower(trim("status")) WHEN 'rumored' THEN 'rumored' WHEN 'planned' THEN 'planned' WHEN 'in production' THEN 'in_production' WHEN 'in_production' THEN 'in_production' WHEN 'post production' THEN 'post_production' WHEN 'post_production' THEN 'post_production' WHEN 'released' THEN 'released' WHEN 'canceled' THEN 'canceled' ELSE NULL END, "original_language", "origin_country", "certificate" FROM `movies`;--> statement-breakpoint
DROP TABLE `movies`;--> statement-breakpoint
ALTER TABLE `__new_movies` RENAME TO `movies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `movies_tmdb_id_index` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `__new_series` (
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
	`vote_average` integer,
	`status` text,
	`original_language` text,
	`origin_country` text,
	`certificate` text,
	`type` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "series_watch_status_check" CHECK("__new_series"."watch_status" IN (0, 1, 2, 3)),
	CONSTRAINT "series_impression_check" CHECK("__new_series"."impression" IN (0, 1, 2)),
	CONSTRAINT "series_status_check" CHECK("__new_series"."status" IS NULL OR "__new_series"."status" IN ('returning_series', 'planned', 'in_production', 'ended', 'canceled', 'pilot'))
);
--> statement-breakpoint
INSERT INTO `__new_series`("id", "tmdb_id", "user_id", "watch_status", "impression", "updated_at", "created_at", "last_watched_at", "completed_at", "name", "first_air_date", "last_air_date", "total_number_of_episodes", "total_number_of_seasons", "total_number_of_episodes_watched", "total_number_of_seasons_watched", "poster_path", "vote_average", "status", "original_language", "origin_country", "certificate", "type") SELECT "id", "tmdb_id", "user_id", "watch_status", "impression", "updated_at", "created_at", "last_watched_at", "completed_at", "name", "first_air_date", "last_air_date", "total_number_of_episodes", "total_number_of_seasons", "total_number_of_episodes_watched", "total_number_of_seasons_watched", "poster_path", "vote_average", CASE lower(trim("status")) WHEN 'returning series' THEN 'returning_series' WHEN 'returning_series' THEN 'returning_series' WHEN 'planned' THEN 'planned' WHEN 'in production' THEN 'in_production' WHEN 'in_production' THEN 'in_production' WHEN 'ended' THEN 'ended' WHEN 'canceled' THEN 'canceled' WHEN 'pilot' THEN 'pilot' ELSE NULL END, "original_language", "origin_country", "certificate", "type" FROM `series`;--> statement-breakpoint
DROP TABLE `series`;--> statement-breakpoint
ALTER TABLE `__new_series` RENAME TO `series`;--> statement-breakpoint
CREATE INDEX `series_tmdb_id_index` ON `series` (`tmdb_id`);