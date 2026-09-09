DROP INDEX "credits_tmdb_id_index";--> statement-breakpoint
DROP INDEX "credits_movie_id_index";--> statement-breakpoint
DROP INDEX "credits_series_id_index";--> statement-breakpoint
DROP INDEX "custom_collection_filters_collection_id_index";--> statement-breakpoint
DROP INDEX "custom_collection_sorts_collection_id_index";--> statement-breakpoint
DROP INDEX "custom_collections_user_id_index";--> statement-breakpoint
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
ALTER TABLE `movies` ALTER COLUMN "vote_average" TO "vote_average" real;--> statement-breakpoint
CREATE INDEX `credits_tmdb_id_index` ON `credits` (`tmdb_id`);--> statement-breakpoint
CREATE INDEX `credits_movie_id_index` ON `credits` (`movie_id`);--> statement-breakpoint
CREATE INDEX `credits_series_id_index` ON `credits` (`series_id`);--> statement-breakpoint
CREATE INDEX `custom_collection_filters_collection_id_index` ON `custom_collection_filters` (`custom_collection_id`);--> statement-breakpoint
CREATE INDEX `custom_collection_sorts_collection_id_index` ON `custom_collection_sorts` (`custom_collection_id`);--> statement-breakpoint
CREATE INDEX `custom_collections_user_id_index` ON `custom_collections` (`user_id`);--> statement-breakpoint
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
ALTER TABLE `series` ALTER COLUMN "vote_average" TO "vote_average" real;--> statement-breakpoint
UPDATE `movies` SET `vote_average` = `vote_average` / 10.0 WHERE `vote_average` IS NOT NULL;--> statement-breakpoint
UPDATE `series` SET `vote_average` = `vote_average` / 10.0 WHERE `vote_average` IS NOT NULL;