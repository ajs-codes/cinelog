CREATE TABLE `movies_to_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`credit_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`credit_id`) REFERENCES `credits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_to_credits_unique` ON `movies_to_credits` (`movie_id`,`credit_id`);--> statement-breakpoint
CREATE INDEX `movies_to_credits_movie_id_index` ON `movies_to_credits` (`movie_id`);--> statement-breakpoint
CREATE INDEX `movies_to_credits_credit_id_index` ON `movies_to_credits` (`credit_id`);--> statement-breakpoint
CREATE TABLE `movies_to_production_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`company_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `production_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_to_production_companies_unique` ON `movies_to_production_companies` (`movie_id`,`company_id`);--> statement-breakpoint
CREATE INDEX `movies_to_production_companies_movie_id_index` ON `movies_to_production_companies` (`movie_id`);--> statement-breakpoint
CREATE INDEX `movies_to_production_companies_company_id_index` ON `movies_to_production_companies` (`company_id`);--> statement-breakpoint
CREATE TABLE `series_to_creators` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`series_id` integer NOT NULL,
	`creator_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_id`) REFERENCES `creators`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_to_creators_unique` ON `series_to_creators` (`series_id`,`creator_id`);--> statement-breakpoint
CREATE INDEX `series_to_creators_series_id_index` ON `series_to_creators` (`series_id`);--> statement-breakpoint
CREATE INDEX `series_to_creators_creator_id_index` ON `series_to_creators` (`creator_id`);--> statement-breakpoint
CREATE TABLE `series_to_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`series_id` integer NOT NULL,
	`credit_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`credit_id`) REFERENCES `credits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_to_credits_unique` ON `series_to_credits` (`series_id`,`credit_id`);--> statement-breakpoint
CREATE INDEX `series_to_credits_series_id_index` ON `series_to_credits` (`series_id`);--> statement-breakpoint
CREATE INDEX `series_to_credits_credit_id_index` ON `series_to_credits` (`credit_id`);--> statement-breakpoint
CREATE TABLE `series_to_production_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`series_id` integer NOT NULL,
	`company_id` integer NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `production_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_to_production_companies_unique` ON `series_to_production_companies` (`series_id`,`company_id`);--> statement-breakpoint
CREATE INDEX `series_to_production_companies_series_id_index` ON `series_to_production_companies` (`series_id`);--> statement-breakpoint
CREATE INDEX `series_to_production_companies_company_id_index` ON `series_to_production_companies` (`company_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`known_for_department` text NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_credits`("id", "tmdb_id", "name", "known_for_department", "created_at") SELECT "id", "tmdb_id", "name", "known_for_department", "created_at" FROM `credits`;--> statement-breakpoint
DROP TABLE `credits`;--> statement-breakpoint
ALTER TABLE `__new_credits` RENAME TO `credits`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `credits_tmdb_id_unique` ON `credits` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `__new_production_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tmdb_id` integer NOT NULL,
	`name` text NOT NULL,
	`origin_country` text,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_production_companies`("id", "tmdb_id", "name", "origin_country", "created_at") SELECT "id", "tmdb_id", "name", "origin_country", "created_at" FROM `production_companies`;--> statement-breakpoint
DROP TABLE `production_companies`;--> statement-breakpoint
ALTER TABLE `__new_production_companies` RENAME TO `production_companies`;--> statement-breakpoint
CREATE UNIQUE INDEX `production_companies_tmdb_id_unique` ON `production_companies` (`tmdb_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `creators_tmdb_id_unique` ON `creators` (`tmdb_id`);--> statement-breakpoint
ALTER TABLE `creators` DROP COLUMN `series_id`;