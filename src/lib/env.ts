import { config } from "dotenv";
import { join } from "path";

// Load environment variables from both .env and .env.local
config({ path: join(process.cwd(), ".env") });
config({ path: join(process.cwd(), ".env.local"), override: true });

// Export environment variables with type safety
export const env = {
  // Server-side only variables
  DATABASE_URL: process.env.DATABASE_URL,
  HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
} as const;

// Client-side variables (must be prefixed with NEXT_PUBLIC_)
export const publicEnv = {
  NEXT_PUBLIC_HASURA_URL: process.env.NEXT_PUBLIC_HASURA_URL,
  NEXT_PUBLIC_JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
} as const;

// Validate required environment variables
const requiredEnvVars = {
  DATABASE_URL: env.DATABASE_URL,
  HASURA_ADMIN_SECRET: env.HASURA_ADMIN_SECRET,
} as const;

const requiredPublicEnvVars = {
  NEXT_PUBLIC_HASURA_URL: publicEnv.NEXT_PUBLIC_HASURA_URL,
  NEXT_PUBLIC_JWT_SECRET: publicEnv.NEXT_PUBLIC_JWT_SECRET,
} as const;

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const missingPublicEnvVars = Object.entries(requiredPublicEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0 || missingPublicEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${[
      ...missingEnvVars,
      ...missingPublicEnvVars,
    ].join(", ")}`
  );
}
