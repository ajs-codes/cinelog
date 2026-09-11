import { SignJWT, jwtVerify } from "jose";

export const AUTH_TOKEN_TTL_SECONDS = 24 * 60 * 60;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_key_change_in_production"
);

export async function signToken(payload: { userId: number; username: string }) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + AUTH_TOKEN_TTL_SECONDS;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; username: string; exp: number };
  } catch {
    return null;
  }
}
