CREATE TABLE `genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`type` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` numeric
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genres_tmdb_id_unique` ON `genres` (`tmdb_id`);