import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectToMongoDB } from "../mongodb";
import {
  ActionItem,
  Announcement,
  AnnouncementRead,
  BreakLog,
  CalendarEvent,
  ChatMessage,
  Compensation,
  ComplianceRecord,
  EmployeeAuditLog,
  EmployeeDocument,
  EmployeeProfile,
  EmploymentDetail,
  FormSubmission,
  JobHistory,
  LeaveApplication,
  Meeting,
  MeetingMinutes,
  MeetingParticipant,
  Note,
  Notification,
  OvertimeEntry,
  Payslip,
  PerformanceRecord,
  Project,
  ProjectAssignment,
  ProjectTask,
  Qualification,
  TimeEntry,
  User,
  WorkSession,
} from "../models";

type EmployeeSeed = {
  name: string;
  designation: string;
  email: string;
  reportsTo?: string;
  division?: string;
  employeeId: string;
  role: "admin" | "user";
  password?: string;
};

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "123456";
const OVERWRITE_PASSWORDS = process.env.SEED_OVERWRITE_PASSWORDS === "true";

const allModels = [
  User,
  TimeEntry,
  WorkSession,
  OvertimeEntry,
  BreakLog,
  LeaveApplication,
  FormSubmission,
  ChatMessage,
  Note,
  Payslip,
  Announcement,
  Project,
  ProjectAssignment,
  ProjectTask,
  Notification,
  AnnouncementRead,
  EmployeeProfile,
  EmploymentDetail,
  JobHistory,
  Compensation,
  PerformanceRecord,
  Qualification,
  EmployeeDocument,
  ComplianceRecord,
  EmployeeAuditLog,
  Meeting,
  MeetingParticipant,
  MeetingMinutes,
  ActionItem,
  CalendarEvent,
];

const employees: EmployeeSeed[] = [
  {
    name: "Abdullah Seia",
    designation: "Founder / CEO",
    email: "seiaabd@gmail.com",
    employeeId: "ADMIN001",
    role: "admin",
  },
  {
    name: "Ommar Seja",
    designation: "Admin",
    email: "ommar.seja@gmail.com",
    employeeId: "ADMIN002",
    role: "admin",
  },
  {
    name: "Hiba Bilwani",
    designation: "Brand Head",
    email: "Hibabilwani49@gmail.com",
    reportsTo: "Abdullah",
    employeeId: "EMP001",
    role: "user",
  },
  {
    name: "Samina Aamir",
    designation: "Head of Marketing and Operations",
    email: "Samina034@gmail.com",
    reportsTo: "Abdullah",
    employeeId: "EMP002",
    role: "user",
  },
  {
    name: "Ayaan Ali",
    designation: "Marketing Executive",
    email: "Ayaanali1221@gmail.com",
    reportsTo: "Hiba",
    division: "Office Team",
    employeeId: "EMP003",
    role: "user",
    password: "ayaan123",
  },
  {
    name: "Ammar",
    designation: "Graphic Designer",
    email: "ammar grafx@gmail.com",
    reportsTo: "Hiba",
    division: "Office Team",
    employeeId: "EMP004",
    role: "user",
  },
  {
    name: "Rameen",
    designation: "Textile Designer",
    email: "Yaseenrameen3@gmail.com",
    reportsTo: "Hiba",
    division: "Office Team",
    employeeId: "EMP005",
    role: "user",
  },
  {
    name: "Huzaifa",
    designation: "Fashion Marketer & Social Media Manager",
    email: "Huzaifamuneer2000@gmai.com",
    reportsTo: "Samina",
    division: "Factory Team",
    employeeId: "EMP006",
    role: "user",
  },
  {
    name: "Sarmad",
    designation: "Inventory Specialist",
    email: "sarmadfareed28@gmail.com",
    reportsTo: "Samina",
    division: "Factory Team",
    employeeId: "EMP007",
    role: "user",
  },
  {
    name: "Ayaz",
    designation: "Operations Manager",
    email: "ayaz.aly1@gmail.com",
    reportsTo: "Samina",
    division: "Factory Team",
    employeeId: "EMP008",
    role: "user",
  },
  {
    name: "Hamza Ashraf",
    designation: "Textile Designer (Remote, on payroll)",
    email: "hamzaashraf4757@gmail.com",
    reportsTo: "Samina",
    division: "Factory Team",
    employeeId: "EMP009",
    role: "user",
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0]?.toLowerCase() || "";
}

async function upsertUsers(passwordHash: string) {
  const usersByName = new Map<string, mongoose.Types.ObjectId>();

  for (const employee of employees) {
    const email = normalizeEmail(employee.email);
    const openId = `emp-${employee.employeeId.toLowerCase()}`;
    const employeePasswordHash = employee.password
      ? await bcrypt.hash(employee.password, 10)
      : passwordHash;
    const existing = await User.findOne({
      $or: [{ employeeId: employee.employeeId }, { email }],
    });

    if (!existing) {
      const created = await User.create({
        openId,
        name: employee.name,
        email,
        loginMethod: "custom",
        role: employee.role,
        employeeId: employee.employeeId,
        password: employeePasswordHash,
        department: employee.division || "",
        position: employee.designation,
        lastSignedIn: new Date(0),
      });
      usersByName.set(firstName(employee.name), created._id);
      continue;
    }

    existing.openId = existing.openId || openId;
    existing.name = employee.name;
    existing.email = email;
    existing.loginMethod = "custom";
    existing.role = employee.role;
    existing.employeeId = employee.employeeId;
    existing.department = employee.division || "";
    existing.position = employee.designation;
    if (employee.password || OVERWRITE_PASSWORDS || !existing.password) {
      existing.password = employeePasswordHash;
    }
    await existing.save();
    usersByName.set(firstName(employee.name), existing._id);
  }

  return usersByName;
}

async function upsertEmployeeDetails(usersByName: Map<string, mongoose.Types.ObjectId>) {
  for (const employee of employees) {
    const userId = usersByName.get(firstName(employee.name));
    if (!userId) {
      throw new Error(`Missing seeded user for ${employee.name}`);
    }

    const supervisorId = employee.reportsTo
      ? usersByName.get(employee.reportsTo.trim().toLowerCase())
      : undefined;

    await EmployeeProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          personalEmail: normalizeEmail(employee.email),
        },
      },
      { upsert: true }
    );

    await EmploymentDetail.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          jobTitle: employee.designation,
          department: employee.division || "",
          employmentStatus: "full_time",
          supervisorId,
          teamStructure: employee.reportsTo ? `Reports to ${employee.reportsTo}` : "",
        },
      },
      { upsert: true }
    );
  }
}

async function ensureCollections() {
  for (const model of allModels) {
    await model.createCollection();
    await model.syncIndexes();
  }
}

async function run() {
  const connected = await connectToMongoDB();
  if (!connected) {
    console.error("[Seed] MongoDB not connected. Check MONGODB_URI.");
    process.exit(1);
  }

  await ensureCollections();
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const usersByName = await upsertUsers(passwordHash);
  await upsertEmployeeDetails(usersByName);

  console.log(`[Seed] Seeded ${employees.length} Movement employees.`);
  console.log(`[Seed] Default password: ${DEFAULT_PASSWORD}`);
  console.log("[Seed] Admin logins: ADMIN001, ADMIN002");
  await mongoose.connection.close();
}

run().catch(error => {
  console.error("[Seed] Failed:", error);
  process.exit(1);
});
