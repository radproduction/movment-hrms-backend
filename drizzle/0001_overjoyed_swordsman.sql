CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `breakLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timeEntryId` int NOT NULL,
	`userId` int NOT NULL,
	`breakStart` timestamp NOT NULL,
	`breakEnd` timestamp,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breakLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`formType` enum('resignation','grievance','feedback') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('submitted','under_review','resolved','closed') NOT NULL DEFAULT 'submitted',
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`respondedBy` int,
	`response` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaveApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leaveType` enum('sick','casual','annual','unpaid','other') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`reason` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaveApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payslips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`basicSalary` decimal(10,2) NOT NULL,
	`allowances` decimal(10,2) DEFAULT '0.00',
	`deductions` decimal(10,2) DEFAULT '0.00',
	`netSalary` decimal(10,2) NOT NULL,
	`workingDays` int NOT NULL,
	`presentDays` int NOT NULL,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payslips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timeIn` timestamp NOT NULL,
	`timeOut` timestamp,
	`totalHours` decimal(5,2),
	`status` enum('active','completed','early_out') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `employeeId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `position` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_employeeId_unique` UNIQUE(`employeeId`);