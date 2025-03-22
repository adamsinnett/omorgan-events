import { randomBytes } from "crypto";

export function generateInvitationToken(): string {
  // Generate a random token using crypto
  const token = randomBytes(32).toString("base64");
  // Replace URL-unsafe characters with safe ones
  return token.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function getInvitationUrl(token: string): string {
  // In production, this would use the actual domain
  return `http://localhost:3000/events/${token}`;
}
