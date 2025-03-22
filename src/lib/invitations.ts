import { randomBytes } from "crypto";

export function generateInvitationToken(): string {
  // Generate a random token using crypto
  const token = randomBytes(32).toString("base64");
  // Replace URL-unsafe characters with safe ones
  return token.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function getInvitationUrl(token: string): string {
  // Use the current domain
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/events/${token}`;
}
