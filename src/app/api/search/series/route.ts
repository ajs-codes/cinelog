import { getSession } from "@/lib/auth/session";
import { fail, ok, toErrorResponse } from "@/lib/http/response";
import { searchQuerySchema } from "@/lib/validations/search";
import { searchTitles } from "@/services/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("query");
    const parsedQuery = searchQuerySchema.safeParse({ query });

    if (!parsedQuery.success) {
      return fail("The query parameter must be a non-empty string", 400);
    }

    const session = await getSession();

    return ok(
      await searchTitles(parsedQuery.data.query, "tv", session?.userId),
    );
  } catch (error) {
    return toErrorResponse(
      error,
      "TMDB search request failed",
      "TMDB search request failed",
    );
  }
}
