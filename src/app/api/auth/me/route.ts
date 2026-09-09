import { clearAuthCookie, getSession } from "@/lib/auth/session";
import { isAppError } from "@/lib/http/errors";
import { fail, ok, toErrorResponse } from "@/lib/http/response";
import { getCurrentUser } from "@/services/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return fail("Unauthorized", 401);
    }

    const user = await getCurrentUser(session.userId);
    return ok({ user });
  } catch (error) {
    // Stale JWT: token verifies, but the user no longer exists in the DB.
    if (isAppError(error) && error.status === 404) {
      await clearAuthCookie();
      return fail("Unauthorized", 401);
    }
    return toErrorResponse(error, "Session verification error");
  }
}
