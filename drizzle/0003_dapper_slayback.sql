CREATE TABLE `projectAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(100),
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`timeEntryId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in_progress','completed','blocked') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','on_hold','completed','cancelled') NOT NULL DEFAULT 'active',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
