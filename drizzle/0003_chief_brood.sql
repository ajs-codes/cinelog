CREATE TABLE `movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`watch_status` integer DEFAULT 0 NOT NULL,
	`impression` integer,
	`created_at` numeric NOT NULL,
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
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `movies_tmdb_id_index` ON `movies` (`tmdb_id`);