CREATE TABLE `user_archives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('tweet','academic') NOT NULL,
	`itemId` varchar(128) NOT NULL,
	`itemData` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_archives_id` PRIMARY KEY(`id`)
);
