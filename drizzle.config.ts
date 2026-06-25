import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Explicitly tell Drizzle to load your Next.js local environment file
dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./db/schema.ts", // Where your SQL tables live
  out: "./drizzle",         // Where migrations will be saved
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});