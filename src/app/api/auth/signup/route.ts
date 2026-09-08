import { parseJson } from "@/lib/http/request";
import { created, fail, toErrorResponse } from "@/lib/http/response";
import { setAuthCookie } from "@/lib/auth/session";
import { signupSchema } from "@/lib/validations/auth";
import { signupUser } from "@/services/auth";

export async function POST(req: Request) {
  try {
    const body = await parseJson(req);
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Validation failed", 400, parsed.error.issues);
    }

    const user = await signupUser(parsed.data);
    await setAuthCookie(user.token);
    return created({ user: user.publicUser });
  } catch (error) {
    return toErrorResponse(error, "Signup error");
  }
}
