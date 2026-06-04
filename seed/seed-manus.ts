import "dotenv/config";
import mongoose from "mongoose";
import { connectToMongoDB } from "../mongodb";
import { Project, ProjectAssignment, User } from "../models";
import { manusProjectAssignments, manusProjects, manusUsers } from "./manus-data";

async function upsertUsers() {
  const usersByOpenId = new Map<string, mongoose.Types.ObjectId>();

  for (const user of manusUsers) {
    const existing = await User.findOne({ openId: user.openId });
    if (!existing) {
      const created = await User.create({
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role,
        employeeId: user.employeeId,
        password: user.passwordHash,
        department: user.department,
        position: user.position,
        lastSignedIn: new Date(),
      });
      usersByOpenId.set(user.openId, created._id);
      continue;
    }

    existing.name = user.name;
    existing.email = user.email;
    existing.loginMethod = user.loginMethod;
    existing.role = user.role;
    existing.employeeId = user.employeeId;
    existing.department = user.department;
    existing.position = user.position;
    if (!existing.password) {
      existing.password = user.passwordHash;
    }
    await existing.save();
    usersByOpenId.set(user.openId, existing._id);
  }

  return usersByOpenId;
}

async function upsertProjects(usersByOpenId: Map<string, mongoose.Types.ObjectId>) {
  const projectsByName = new Map<string, mongoose.Types.ObjectId>();

  for (const project of manusProjects) {
    const createdBy = usersByOpenId.get(project.createdByOpenId);
    if (!createdBy) {
      throw new Error(`Missing user for project createdBy: ${project.createdByOpenId}`);
    }

    const existing = await Project.findOne({ name: project.name });
    if (!existing) {
      const created = await Project.create({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        source: project.source ?? "team_lead",
        createdBy,
      });
      projectsByName.set(project.name, created._id);
      continue;
    }

    existing.description = project.description;
    existing.status = project.status;
    existing.priority = project.priority;
    existing.source = project.source ?? existing.source;
    existing.createdBy = createdBy;
    await existing.save();
    projectsByName.set(project.name, existing._id);
  }

  return projectsByName;
}

async function upsertProjectAssignments(
  usersByOpenId: Map<string, mongoose.Types.ObjectId>,
  projectsByName: Map<string, mongoose.Types.ObjectId>
) {
  for (const assignment of manusProjectAssignments) {
    const userId = usersByOpenId.get(assignment.userOpenId);
    const projectId = projectsByName.get(assignment.projectName);
    if (!userId) {
      throw new Error(`Missing user for assignment: ${assignment.userOpenId}`);
    }
    if (!projectId) {
      throw new Error(`Missing project for assignment: ${assignment.projectName}`);
    }

    const existing = await ProjectAssignment.findOne({
      userId,
      projectId,
      role: assignment.role,
    });

    if (!existing) {
      await ProjectAssignment.create({
        userId,
        projectId,
        role: assignment.role,
        assignedAt: new Date(),
      });
    }
  }
}

async function run() {
  const connected = await connectToMongoDB();
  if (!connected) {
    console.error("[Seed] MongoDB not connected. Check MONGODB_URI.");
    process.exit(1);
  }

  const usersByOpenId = await upsertUsers();
  const projectsByName = await upsertProjects(usersByOpenId);
  await upsertProjectAssignments(usersByOpenId, projectsByName);

  console.log("[Seed] Manus data seeded successfully.");
  await mongoose.connection.close();
}

run().catch(error => {
  console.error("[Seed] Failed:", error);
  process.exit(1);
});
