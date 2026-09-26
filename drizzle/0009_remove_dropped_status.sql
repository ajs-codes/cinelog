DELETE FROM `user_season_progress` WHERE `user_series_id` IN (SELECT `id` FROM `user_series` WHERE `watch_status` = 3);--> statement-breakpoint
DELETE FROM `user_series` WHERE `watch_status` = 3;--> statement-breakpoint
DELETE FROM `user_movies` WHERE `watch_status` = 3;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	`watch_status` integer DEFAULT 0 NOT NULL,
	`impression` integer,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`updated_at` numeric,
	`completed_at` numeric,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "user_movies_watch_status_check" CHECK("__new_user_movies"."watch_status" IN (0, 1, 2)),
	CONSTRAINT "user_movies_impression_check" CHECK("__new_user_movies"."impression" IS NULL OR "__new_user_movies"."impression" IN (0, 1, 2))
);
--> statement-breakpoint
INSERT INTO `__new_user_movies`("id", "user_id", "movie_id", "watch_status", "impression", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "movie_id", "watch_status", "impression", "created_at", "updated_at", "completed_at" FROM `user_movies`;--> statement-breakpoint
DROP TABLE `user_movies`;--> statement-breakpoint
ALTER TABLE `__new_user_movies` RENAME TO `user_movies`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_movies_user_id_movie_id_unique` ON `user_movies` (`user_id`,`movie_id`);--> statement-breakpoint
CREATE INDEX `user_movies_user_id_index` ON `user_movies` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_movies_user_id_created_at_index` ON `user_movies` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `user_movies_user_id_watch_status_index` ON `user_movies` (`user_id`,`watch_status`);--> statement-breakpoint
CREATE INDEX `user_movies_user_id_impression_index` ON `user_movies` (`user_id`,`impression`);--> statement-breakpoint
CREATE INDEX `user_movies_user_id_completed_at_index` ON `user_movies` (`user_id`,`completed_at`);--> statement-breakpoint
CREATE TABLE `__new_user_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`series_id` integer NOT NULL,
	`watch_status` integer DEFAULT 0 NOT NULL,
	`impression` integer,
	`last_watched_at` numeric,
	`completed_at` numeric,
	`total_number_of_episodes_watched` integer DEFAULT 0 NOT NULL,
	`total_number_of_seasons_watched` integer DEFAULT 0 NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`updated_at` numeric,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "user_series_watch_status_check" CHECK("__new_user_series"."watch_status" IN (0, 1, 2)),
	CONSTRAINT "user_series_impression_check" CHECK("__new_user_series"."impression" IS NULL OR "__new_user_series"."impression" IN (0, 1, 2)),
	CONSTRAINT "user_series_total_episodes_watched_check" CHECK("__new_user_series"."total_number_of_episodes_watched" >= 0),
	CONSTRAINT "user_series_total_seasons_watched_check" CHECK("__new_user_series"."total_number_of_seasons_watched" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_user_series`("id", "user_id", "series_id", "watch_status", "impression", "last_watched_at", "completed_at", "total_number_of_episodes_watched", "total_number_of_seasons_watched", "created_at", "updated_at") SELECT "id", "user_id", "series_id", "watch_status", "impression", "last_watched_at", "completed_at", "total_number_of_episodes_watched", "total_number_of_seasons_watched", "created_at", "updated_at" FROM `user_series`;--> statement-breakpoint
DROP TABLE `user_series`;--> statement-breakpoint
ALTER TABLE `__new_user_series` RENAME TO `user_series`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_series_user_id_series_id_unique` ON `user_series` (`user_id`,`series_id`);--> statement-breakpoint
CREATE INDEX `user_series_user_id_index` ON `user_series` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_series_user_id_created_at_index` ON `user_series` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `user_series_user_id_watch_status_index` ON `user_series` (`user_id`,`watch_status`);--> statement-breakpoint
CREATE INDEX `user_series_user_id_impression_index` ON `user_series` (`user_id`,`impression`);--> statement-breakpoint
CREATE INDEX `user_series_user_id_completed_at_index` ON `user_series` (`user_id`,`completed_at`);--> statement-breakpoint
CREATE INDEX `user_series_user_id_last_watched_at_index` ON `user_series` (`user_id`,`last_watched_at`);--> statement-breakpoint
PRAGMA foreign_keys=ON;