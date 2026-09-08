import { clearAuthCookie } from "@/lib/auth/session";
import { ok } from "@/lib/http/response";

export async function POST() {
  await clearAuthCookie();
  return ok({ success: true });
}
