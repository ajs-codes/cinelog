import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { signupSchema } from "@/lib/validations/auth";
import { signToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const { username, email, password, displayName } = result.data;
    const db = getDb();

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.username, username), eq(users.email, email)),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Insert user
    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash,
      displayName: displayName || null,
    }).returning();

    // Create session token
    const token = await signToken({ userId: newUser.id, username: newUser.username });

    // Set cookie
    (await
      // Set cookie
      cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
