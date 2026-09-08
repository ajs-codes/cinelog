import { getSession } from "@/lib/auth/session";
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
    return toErrorResponse(error, "Session verification error");
  }
}
