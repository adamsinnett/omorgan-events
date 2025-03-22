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
