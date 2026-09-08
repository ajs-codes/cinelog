import { parseJson } from "@/lib/http/request";
import { fail, ok, toErrorResponse } from "@/lib/http/response";
import { setAuthCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser } from "@/services/auth";

export async function POST(req: Request) {
  try {
    const body = await parseJson(req);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Validation failed", 400, parsed.error.issues);
    }

    const user = await loginUser(parsed.data);
    await setAuthCookie(user.token);
    return ok({ user: user.publicUser });
  } catch (error) {
    return toErrorResponse(error, "Login error");
  }
}
