import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

export async function connectDB() {
  // Check if we already have a connection active
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // If no connection exists, open a new one safely
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}