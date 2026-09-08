import { requireSession } from "@/lib/auth/session";
import { ok, toErrorResponse } from "@/lib/http/response";
import { getLibrary } from "@/services/library";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    const library = await getLibrary(session.userId);
    return ok(library);
  } catch (error) {
    return toErrorResponse(error, "Failed to load library", "Failed to load library");
  }
}
