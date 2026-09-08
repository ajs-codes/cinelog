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
CREATE UNIQUE INDEX `seasons_series_season_number_unique` ON `seasons` (`series_id`,`season_number`);