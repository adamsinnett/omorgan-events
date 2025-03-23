import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { env } from "@/lib/env";

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const { rows } = await query("SELECT * FROM admin_users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      email: user.email,
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "admin",
        "x-hasura-allowed-roles": ["admin"],
        "x-hasura-user-email": user.email,
      },
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
