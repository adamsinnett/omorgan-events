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
const requiredEnvVars = {
  DATABASE_URL: env.DATABASE_URL,
  NEXT_PUBLIC_HASURA_URL: env.NEXT_PUBLIC_HASURA_URL,
  HASURA_ADMIN_SECRET: env.HASURA_ADMIN_SECRET,
} as const;

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}
