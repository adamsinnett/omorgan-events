import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { JWTClaims } from "@/types/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function generateToken(claims: Omit<JWTClaims, "iat" | "exp">) {
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTClaims> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTClaims;
  } catch {
    throw new Error("Invalid token");
  }
}

export function getTokenFromHeader(header: string | null): string | null {
  if (!header) return null;

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
