CREATE TABLE `credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer,
	`series_id` integer,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`known_for_department` text NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "credits_exactly_one_parent_check" CHECK(("credits"."movie_id" IS NOT NULL AND "credits"."series_id" IS NULL) OR ("credits"."movie_id" IS NULL AND "credits"."series_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `credits_tmdb_id_index` ON `credits` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `credits_movie_id_index` ON `credits` (`movie_id`);--> statement-breakpoint
CREATE INDEX `credits_series_id_index` ON `credits` (`series_id`);