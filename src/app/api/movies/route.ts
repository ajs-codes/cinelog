import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { movies } from "@/db/schema";
import { movieInputSchema } from "@/lib/validation/movie";

export async function GET() {
  try {
    const result = await getDb()
      .select()
      .from(movies)
      .orderBy(desc(movies.createdAt));

    return Response.json(result);
  } catch {
    return Response.json(
      { error: "Database is not configured or unavailable" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = movieInputSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid movie payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const [movie] = await getDb()
      .insert(movies)
      .values(parsed.data)
      .returning();
    return Response.json(movie, { status: 201 });
  } catch {
    return Response.json(
      { error: "Database is not configured or unavailable" },
      { status: 503 },
    );
  }
}
