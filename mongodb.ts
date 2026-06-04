import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export async function connectToMongoDB(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  if (!MONGODB_URI) {
    console.warn("[MongoDB] MONGODB_URI is not configured");
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("[MongoDB] Connected successfully");
    return true;
  } catch (error) {
    console.error("[MongoDB] Failed to connect", error);
    // Don't throw - allow app to start even if MongoDB is not available
    // This is useful for development when MongoDB might not be running locally
    return false;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (isConnected) {
    await mongoose.connection.close();
    console.log("[MongoDB] Connection closed");
    process.exit(0);
  }
});
