import "dotenv/config";

import mongoose from "mongoose";
import { connectToMongoDB } from "../mongodb";
import { User } from "../models";

async function run() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error("Usage: tsx seed/reset-2fa.ts <email-or-employeeId>");
    process.exit(1);
  }

  const connected = await connectToMongoDB();
  if (!connected) {
    console.error("[Reset 2FA] MongoDB not connected. Check MONGODB_URI.");
    process.exit(1);
  }

  const query = identifier.includes("@")
    ? { email: identifier }
    : { employeeId: identifier };

  const user = await User.findOne(query);
  if (!user) {
    console.error("[Reset 2FA] User not found for:", identifier);
    process.exit(1);
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  console.log(`[Reset 2FA] Reset complete for ${identifier}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("[Reset 2FA] Failed:", err);
  process.exit(1);
});
