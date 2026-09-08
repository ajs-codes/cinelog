CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`watch_status` integer DEFAULT 0 NOT NULL,
	`impression` integer,
	`created_at` numeric NOT NULL,
	`updated_at` numeric,
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
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `series_tmdb_id_index` ON `series` (`tmdb_id`);