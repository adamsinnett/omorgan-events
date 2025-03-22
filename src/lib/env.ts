import { config } from "dotenv";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(process.cwd(), ".env.local") });

// Export environment variables with type safety
export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_HASURA_URL: process.env.NEXT_PUBLIC_HASURA_URL,
  HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
} as const;

// Validate required environment variables
if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}
