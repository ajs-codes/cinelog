CREATE TABLE `production_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer,
	`series_id` integer,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`origin_country` text,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "production_companies_exactly_one_parent_check" CHECK(("production_companies"."movie_id" IS NOT NULL AND "production_companies"."series_id" IS NULL) OR ("production_companies"."movie_id" IS NULL AND "production_companies"."series_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `production_companies_tmdb_id_index` ON `production_companies` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `production_companies_movie_id_index` ON `production_companies` (`movie_id`);--> statement-breakpoint
CREATE INDEX `production_companies_series_id_index` ON `production_companies` (`series_id`);