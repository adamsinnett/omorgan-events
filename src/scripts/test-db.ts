import { config } from "dotenv";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(process.cwd(), ".env.local") });

// Verify environment variables are loaded
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

// Import database module after environment variables are loaded
import { query } from "../lib/db";

async function testConnection() {
  try {
    const result = await query("SELECT NOW()");
    console.log("Database connection successful:", result.rows[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    process.exit();
  }
}

testConnection();
