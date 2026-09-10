CREATE UNIQUE INDEX `movies_user_id_tmdb_id_unique` ON `movies` (`user_id`,`tmdb_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `series_user_id_tmdb_id_unique` ON `series` (`user_id`,`tmdb_id`);