CREATE TABLE `movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`year` integer,
	`genre` text,
	`watched` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
