DROP INDEX "credits_tmdb_id_index";--> statement-breakpoint
DROP INDEX "credits_movie_id_index";--> statement-breakpoint
DROP INDEX "credits_series_id_index";--> statement-breakpoint
DROP INDEX "genres_tmdb_id_unique";--> statement-breakpoint
DROP INDEX "movies_tmdb_id_index";--> statement-breakpoint
DROP INDEX "movies_to_genres_movie_genre_unique";--> statement-breakpoint
DROP INDEX "production_companies_tmdb_id_index";--> statement-breakpoint
DROP INDEX "production_companies_movie_id_index";--> statement-breakpoint
DROP INDEX "production_companies_series_id_index";--> statement-breakpoint
DROP INDEX "seasons_tmdb_id_index";--> statement-breakpoint
DROP INDEX "seasons_series_id_index";--> statement-breakpoint
DROP INDEX "seasons_series_season_number_unique";--> statement-breakpoint
DROP INDEX "series_tmdb_id_index";--> statement-breakpoint
DROP INDEX "series_to_genres_series_genre_unique";--> statement-breakpoint
DROP INDEX "users_username_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `genres` ALTER COLUMN "created_at" TO "created_at" numeric DEFAULT (unixepoch());--> statement-breakpoint
CREATE INDEX `credits_tmdb_id_index` ON `credits` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `credits_movie_id_index` ON `credits` (`movie_id`);--> statement-breakpoint
CREATE INDEX `credits_series_id_index` ON `credits` (`series_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `genres_tmdb_id_unique` ON `genres` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `movies_tmdb_id_index` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `movies_to_genres_movie_genre_unique` ON `movies_to_genres` (`movie_id`,`genres_id`);--> statement-breakpoint
CREATE INDEX `production_companies_tmdb_id_index` ON `production_companies` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `production_companies_movie_id_index` ON `production_companies` (`movie_id`);--> statement-breakpoint
CREATE INDEX `production_companies_series_id_index` ON `production_companies` (`series_id`);--> statement-breakpoint
CREATE INDEX `seasons_tmdb_id_index` ON `seasons` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `seasons_series_id_index` ON `seasons` (`series_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `seasons_series_season_number_unique` ON `seasons` (`series_id`,`season_number`);--> statement-breakpoint
CREATE INDEX `series_tmdb_id_index` ON `series` (`tmdb_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `series_to_genres_series_genre_unique` ON `series_to_genres` (`series_id`,`genres_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `movies` ALTER COLUMN "created_at" TO "created_at" numeric NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `series` ALTER COLUMN "created_at" TO "created_at" numeric NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `creators` ADD `created_at` numeric DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `credits` ADD `created_at` numeric DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `movies_to_genres` ADD `created_at` numeric DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `production_companies` ADD `created_at` numeric DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `series_to_genres` ADD `created_at` numeric DEFAULT (unixepoch()) NOT NULL;