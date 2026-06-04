CREATE TABLE `compensation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`annualSalary` decimal(12,2),
	`monthlySalary` decimal(12,2),
	`payFrequency` enum('monthly','bi_weekly','weekly') DEFAULT 'monthly',
	`basicPay` decimal(12,2),
	`conveyanceAllowance` decimal(12,2),
	`medicalAllowance` decimal(12,2),
	`housingAllowance` decimal(12,2),
	`otherAllowances` decimal(12,2),
	`bankName` varchar(255),
	`accountNumber` varchar(100),
	`routingNumber` varchar(100),
	`swiftCode` varchar(50),
	`taxId` varchar(100),
	`taxDeclarations` text,
	`withholdingDetails` text,
	`healthInsurance` text,
	`retirementPlan` text,
	`otherBenefits` text,
	`effectiveDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compensation_id` PRIMARY KEY(`id`),
	CONSTRAINT `compensation_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `complianceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`backgroundCheckStatus` enum('pending','in_progress','completed','failed'),
	`backgroundCheckDate` date,
	`backgroundCheckNotes` text,
	`workPermitNumber` varchar(100),
	`workPermitExpiryDate` date,
	`visaNumber` varchar(100),
	`visaExpiryDate` date,
	`visaType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`changedBy` int NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`fieldName` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changeReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('offer_letter','contract','id_proof','policy_acknowledgment','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`documentUrl` text NOT NULL,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dateOfBirth` date,
	`gender` enum('male','female','other'),
	`maritalStatus` enum('single','married','divorced','widowed'),
	`nationality` varchar(100),
	`personalEmail` varchar(320),
	`homePhone` varchar(20),
	`mobilePhone` varchar(20),
	`currentAddress` text,
	`permanentAddress` text,
	`emergencyContactName` varchar(255),
	`emergencyContactRelationship` varchar(100),
	`emergencyContactPhone` varchar(20),
	`profileImageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employeeProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `employmentDetails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobTitle` varchar(255),
	`department` varchar(100),
	`subUnit` varchar(100),
	`employmentStatus` enum('full_time','part_time','contract','intern') DEFAULT 'full_time',
	`supervisorId` int,
	`teamStructure` text,
	`joinedDate` date,
	`probationEndDate` date,
	`contractEndDate` date,
	`workLocation` varchar(255),
	`shift` varchar(100),
	`weeklyHours` int DEFAULT 40,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employmentDetails_id` PRIMARY KEY(`id`),
	CONSTRAINT `employmentDetails_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `jobHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`previousTitle` varchar(255),
	`newTitle` varchar(255),
	`previousDepartment` varchar(100),
	`newDepartment` varchar(100),
	`changeType` enum('promotion','transfer','demotion','role_change'),
	`effectiveDate` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reviewDate` date NOT NULL,
	`reviewPeriod` varchar(100),
	`rating` decimal(3,2),
	`goals` text,
	`achievements` text,
	`feedback` text,
	`reviewerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qualifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('education','certification','training','skill','language') NOT NULL,
	`title` varchar(255) NOT NULL,
	`institution` varchar(255),
	`completionDate` date,
	`expiryDate` date,
	`level` varchar(100),
	`documentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qualifications_id` PRIMARY KEY(`id`)
);
