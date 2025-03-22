import { config } from "dotenv";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(process.cwd(), ".env.local") });

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
