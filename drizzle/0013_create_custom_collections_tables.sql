CREATE TABLE `custom_collection_filters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`custom_collection_id` integer NOT NULL,
	`field` text NOT NULL,
	`operator` integer NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`custom_collection_id`) REFERENCES `custom_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `custom_collection_filters_collection_id_index` ON `custom_collection_filters` (`custom_collection_id`);--> statement-breakpoint
CREATE TABLE `custom_collection_sorts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`custom_collection_id` integer NOT NULL,
	`field` text NOT NULL,
	`direction` integer NOT NULL,
	`priority` integer NOT NULL,
	FOREIGN KEY (`custom_collection_id`) REFERENCES `custom_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `custom_collection_sorts_collection_id_index` ON `custom_collection_sorts` (`custom_collection_id`);--> statement-breakpoint
CREATE TABLE `custom_collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`media_type` integer NOT NULL,
	`show_in_dashboard` integer DEFAULT false NOT NULL,
	`show_in_library` integer DEFAULT false NOT NULL,
	`group_by` integer,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` numeric DEFAULT (unixepoch()) NOT NULL,
	`updated_at` numeric,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "custom_collections_group_by_check" CHECK("custom_collections"."group_by" IS NULL OR ("custom_collections"."show_in_dashboard" = 0 AND "custom_collections"."show_in_library" = 1)),
	CONSTRAINT "custom_collections_media_type_check" CHECK("custom_collections"."media_type" IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `custom_collections_user_id_index` ON `custom_collections` (`user_id`);