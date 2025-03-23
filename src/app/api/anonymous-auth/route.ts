import { NextResponse } from "next/server";
import * as jose from "jose";
import { env } from "@/lib/env";

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Create a new JWT with the invitation token as a claim
    const jwt = await new jose.SignJWT({
      invitation_token: token,
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-user-email": token,
      },
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return NextResponse.json({ token: jwt });
  } catch (error) {
    console.error("Error generating anonymous token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
