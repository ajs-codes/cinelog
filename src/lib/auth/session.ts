import { cookies } from "next/headers";
import { AppError } from "@/lib/http/errors";
import { signToken, verifyToken } from "@/lib/auth/jwt";

const AUTH_COOKIE = "auth_token";
const AUTH_COOKIE_MAX_AGE = 8 * 60 * 60;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge,
    path: "/",
  };
}

export async function setAuthCookie(token: string) {
  (await cookies()).set(AUTH_COOKIE, token, cookieOptions(AUTH_COOKIE_MAX_AGE));
}

export async function clearAuthCookie() {
  (await cookies()).set(AUTH_COOKIE, "", cookieOptions(0));
}

export async function getSession() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new AppError("Unauthorized", 401);
  }
  return session;
}

export async function createSessionToken(user: {
  userId: number;
  username: string;
}) {
  return signToken(user);
}
