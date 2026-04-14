CREATE TABLE `analysisHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalText` text NOT NULL,
	`correctedText` text NOT NULL,
	`spellingErrors` int NOT NULL DEFAULT 0,
	`grammarErrors` int NOT NULL DEFAULT 0,
	`totalWords` int NOT NULL DEFAULT 0,
	`errorRate` varchar(10) NOT NULL DEFAULT '0%',
	`analysisData` text NOT NULL,
	`fileName` varchar(255),
	`fileType` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analysisHistory` ADD CONSTRAINT `analysisHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;