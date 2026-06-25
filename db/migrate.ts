import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment variables!");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function runMigration() {
  try {
    console.log("Connecting to Neon and pushing migrations...");
    
    // This looks at your generated folder and pushes it explicitly over the HTTP driver
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("Database migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  }
}

runMigration();