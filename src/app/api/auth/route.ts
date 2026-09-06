import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function GET() {
  return Response.json({ authenticated: false });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!credentialsSchema.safeParse(payload).success) {
    return Response.json(
      { error: "Invalid credentials payload" },
      { status: 400 },
    );
  }

  return Response.json(
    { error: "Authentication provider is not configured" },
    { status: 501 },
  );
}
