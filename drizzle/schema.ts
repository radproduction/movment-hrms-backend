import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, bigint, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // HRMS specific fields
  employeeId: varchar("employeeId", { length: 64 }).unique(),
  password: varchar("password", { length: 255 }), // For custom auth (Hassan, Talha)
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  avatar: varchar("avatar", { length: 500 }), // Superhero avatar selection or uploaded image URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Time entries for tracking employee work hours
 */
export const timeEntries = mysqlTable("timeEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  timeIn: timestamp("timeIn").notNull(),
  timeOut: timestamp("timeOut"),
  totalHours: decimal("totalHours", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["active", "completed", "early_out"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

/**
 * Break logs for tracking breaks during work hours
 */
export const breakLogs = mysqlTable("breakLogs", {
  id: int("id").autoincrement().primaryKey(),
  timeEntryId: int("timeEntryId").notNull(),
  userId: int("userId").notNull(),
  breakStart: timestamp("breakStart").notNull(),
  breakEnd: timestamp("breakEnd"),
  duration: int("duration"), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BreakLog = typeof breakLogs.$inferSelect;
export type InsertBreakLog = typeof breakLogs.$inferInsert;

/**
 * Leave applications and tracking
 */
export const leaveApplications = mysqlTable("leaveApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leaveType: mysqlEnum("leaveType", ["sick", "casual", "annual", "unpaid", "other"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeaveApplication = typeof leaveApplications.$inferSelect;
export type InsertLeaveApplication = typeof leaveApplications.$inferInsert;

/**
 * Forms submissions (resignation, grievance, feedback)
 */
export const formSubmissions = mysqlTable("formSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  formType: mysqlEnum("formType", ["resignation", "leave", "grievance", "feedback"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["submitted", "under_review", "resolved", "closed"]).default("submitted").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  respondedBy: int("respondedBy"),
  response: text("response"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = typeof formSubmissions.$inferInsert;

/**
 * Chat messages for team communication
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId"), // null for broadcast messages
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Payslips for employees
 */
export const payslips = mysqlTable("payslips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  basicSalary: decimal("basicSalary", { precision: 10, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0.00"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0.00"),
  netSalary: decimal("netSalary", { precision: 10, scale: 2 }).notNull(),
  workingDays: int("workingDays").notNull(),
  presentDays: int("presentDays").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payslip = typeof payslips.$inferSelect;
export type InsertPayslip = typeof payslips.$inferInsert;

/**
 * Announcements for all employees
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Projects for task and work tracking
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "on_hold", "completed", "cancelled"]).default("active").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  source: mysqlEnum("source", ["team_lead", "employee"]).default("team_lead").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project assignments to employees
 */
export const projectAssignments = mysqlTable("projectAssignments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  role: varchar("role", { length: 100 }), // e.g., "Developer", "Designer", "Lead"
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = typeof projectAssignments.$inferInsert;

/**
 * Tasks within projects
 */
export const projectTasks = mysqlTable("projectTasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(), // Task assigned to
  timeEntryId: int("timeEntryId"), // Link to time entry when task is logged
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "completed", "blocked"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

/**
 * System notifications for employees
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "project_assigned",
    "attendance_issue",
    "hours_shortfall",
    "leave_approved",
    "leave_rejected",
    "announcement",
    "system_alert"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedId: int("relatedId"), // ID of related entity (project, announcement, etc.)
  relatedType: varchar("relatedType", { length: 50 }), // Type of related entity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Track which announcements users have read
 */
export const announcementReads = mysqlTable("announcementReads", {
  id: int("id").autoincrement().primaryKey(),
  announcementId: int("announcementId").notNull(),
  userId: int("userId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type AnnouncementRead = typeof announcementReads.$inferSelect;
export type InsertAnnouncementRead = typeof announcementReads.$inferInsert;

/**
 * Extended employee profiles with comprehensive information
 */
export const employeeProfiles = mysqlTable("employeeProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Personal Details
  dateOfBirth: date("dateOfBirth"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  maritalStatus: mysqlEnum("maritalStatus", ["single", "married", "divorced", "widowed"]),
  nationality: varchar("nationality", { length: 100 }),
  
  // Contact Information
  personalEmail: varchar("personalEmail", { length: 320 }),
  homePhone: varchar("homePhone", { length: 20 }),
  mobilePhone: varchar("mobilePhone", { length: 20 }),
  currentAddress: text("currentAddress"),
  permanentAddress: text("permanentAddress"),
  
  // Emergency Contact
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactRelationship: varchar("emergencyContactRelationship", { length: 100 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 20 }),
  
  // Profile
  profileImageUrl: text("profileImageUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type InsertEmployeeProfile = typeof employeeProfiles.$inferInsert;

/**
 * Employment details and job information
 */
export const employmentDetails = mysqlTable("employmentDetails", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Job Information
  jobTitle: varchar("jobTitle", { length: 255 }),
  department: varchar("department", { length: 100 }),
  subUnit: varchar("subUnit", { length: 100 }),
  employmentStatus: mysqlEnum("employmentStatus", ["full_time", "part_time", "contract", "intern"]).default("full_time"),
  
  // Reporting Structure
  supervisorId: int("supervisorId"),
  teamStructure: text("teamStructure"), // JSON array of direct reports
  
  // Key Dates
  joinedDate: date("joinedDate"),
  probationEndDate: date("probationEndDate"),
  contractEndDate: date("contractEndDate"),
  
  // Location & Schedule
  workLocation: varchar("workLocation", { length: 255 }),
  shift: varchar("shift", { length: 100 }),
  weeklyHours: int("weeklyHours").default(40),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmploymentDetail = typeof employmentDetails.$inferSelect;
export type InsertEmploymentDetail = typeof employmentDetails.$inferInsert;

/**
 * Job history tracking promotions and transfers
 */
export const jobHistory = mysqlTable("jobHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  previousTitle: varchar("previousTitle", { length: 255 }),
  newTitle: varchar("newTitle", { length: 255 }),
  previousDepartment: varchar("previousDepartment", { length: 100 }),
  newDepartment: varchar("newDepartment", { length: 100 }),
  changeType: mysqlEnum("changeType", ["promotion", "transfer", "demotion", "role_change"]),
  effectiveDate: date("effectiveDate").notNull(),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobHistory = typeof jobHistory.$inferSelect;
export type InsertJobHistory = typeof jobHistory.$inferInsert;

/**
 * Financial and compensation details
 */
export const compensation = mysqlTable("compensation", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Salary Information
  annualSalary: decimal("annualSalary", { precision: 12, scale: 2 }),
  monthlySalary: decimal("monthlySalary", { precision: 12, scale: 2 }),
  payFrequency: mysqlEnum("payFrequency", ["monthly", "bi_weekly", "weekly"]).default("monthly"),
  basicPay: decimal("basicPay", { precision: 12, scale: 2 }),
  conveyanceAllowance: decimal("conveyanceAllowance", { precision: 12, scale: 2 }),
  medicalAllowance: decimal("medicalAllowance", { precision: 12, scale: 2 }),
  housingAllowance: decimal("housingAllowance", { precision: 12, scale: 2 }),
  otherAllowances: decimal("otherAllowances", { precision: 12, scale: 2 }),
  
  // Bank Details
  bankName: varchar("bankName", { length: 255 }),
  accountNumber: varchar("accountNumber", { length: 100 }),
  routingNumber: varchar("routingNumber", { length: 100 }),
  swiftCode: varchar("swiftCode", { length: 50 }),
  
  // Tax Information
  taxId: varchar("taxId", { length: 100 }),
  taxDeclarations: text("taxDeclarations"), // JSON
  withholdingDetails: text("withholdingDetails"), // JSON
  
  // Benefits
  healthInsurance: text("healthInsurance"), // JSON
  retirementPlan: text("retirementPlan"), // JSON
  otherBenefits: text("otherBenefits"), // JSON
  
  effectiveDate: date("effectiveDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Compensation = typeof compensation.$inferSelect;
export type InsertCompensation = typeof compensation.$inferInsert;

/**
 * Performance and compliance records
 */
export const performanceRecords = mysqlTable("performanceRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  reviewDate: date("reviewDate").notNull(),
  reviewPeriod: varchar("reviewPeriod", { length: 100 }), // e.g., "Q1 2026"
  rating: decimal("rating", { precision: 3, scale: 2 }), // e.g., 4.5 out of 5
  goals: text("goals"), // JSON array
  achievements: text("achievements"), // JSON array
  feedback: text("feedback"),
  reviewerId: int("reviewerId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceRecord = typeof performanceRecords.$inferSelect;
export type InsertPerformanceRecord = typeof performanceRecords.$inferInsert;

/**
 * Training and qualifications
 */
export const qualifications = mysqlTable("qualifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", ["education", "certification", "training", "skill", "language"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }),
  completionDate: date("completionDate"),
  expiryDate: date("expiryDate"),
  level: varchar("level", { length: 100 }), // e.g., "Bachelor's", "Advanced", "Fluent"
  documentUrl: text("documentUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Qualification = typeof qualifications.$inferSelect;
export type InsertQualification = typeof qualifications.$inferInsert;

/**
 * Employee documents
 */
export const employeeDocuments = mysqlTable("employeeDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  documentType: mysqlEnum("documentType", ["offer_letter", "contract", "id_proof", "policy_acknowledgment", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  documentUrl: text("documentUrl").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = typeof employeeDocuments.$inferInsert;

/**
 * Background verification and compliance
 */
export const complianceRecords = mysqlTable("complianceRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Background Verification
  backgroundCheckStatus: mysqlEnum("backgroundCheckStatus", ["pending", "in_progress", "completed", "failed"]),
  backgroundCheckDate: date("backgroundCheckDate"),
  backgroundCheckNotes: text("backgroundCheckNotes"),
  
  // Immigration & Work Authorization
  workPermitNumber: varchar("workPermitNumber", { length: 100 }),
  workPermitExpiryDate: date("workPermitExpiryDate"),
  visaNumber: varchar("visaNumber", { length: 100 }),
  visaExpiryDate: date("visaExpiryDate"),
  visaType: varchar("visaType", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = typeof complianceRecords.$inferInsert;

/**
 * Audit log for tracking changes to sensitive employee data
 */
export const employeeAuditLog = mysqlTable("employeeAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Employee whose data was changed
  changedBy: int("changedBy").notNull(), // Admin who made the change
  
  tableName: varchar("tableName", { length: 100 }).notNull(),
  fieldName: varchar("fieldName", { length: 100 }).notNull(),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeReason: text("changeReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmployeeAuditLog = typeof employeeAuditLog.$inferSelect;
export type InsertEmployeeAuditLog = typeof employeeAuditLog.$inferInsert;

/**
 * Meetings table for scheduling and managing meetings
 */
export const meetings = mysqlTable("meetings", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  agenda: text("agenda"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  meetingLink: varchar("meetingLink", { length: 500 }),
  organizerId: int("organizerId").notNull(),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  meetingMinutes: text("meetingMinutes"),
  actionItems: text("actionItems"), // JSON string of action items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;

/**
 * Meeting participants table for tracking who's invited to meetings
 */
export const meetingParticipants = mysqlTable("meetingParticipants", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(),
  userId: int("userId").notNull(),
  responseStatus: mysqlEnum("responseStatus", ["pending", "accepted", "declined", "tentative"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type InsertMeetingParticipant = typeof meetingParticipants.$inferInsert;

/**
 * Calendar events table for personal events, reminders, and non-meeting events
 */
export const calendarEvents = mysqlTable("calendarEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  eventType: mysqlEnum("eventType", ["reminder", "personal", "deadline", "holiday"]).default("personal").notNull(),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
