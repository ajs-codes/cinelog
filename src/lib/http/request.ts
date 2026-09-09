import type { ZodType } from "zod";
import { AppError } from "@/lib/http/errors";

export async function parseJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new AppError("Invalid JSON body", 400);
  }
}

export function parsePositiveIntId(id: string, label: string) {
  const value = Number(id);

  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`Invalid ${label} ID`, 400);
  }

  return value;
}

const DIRECT_VALIDATION_MESSAGES = new Set([
  "Invalid watch_status",
  "Invalid impression",
  "No valid fields to update",
]);

export function parseSchema<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation failed";
    if (DIRECT_VALIDATION_MESSAGES.has(message)) {
      throw new AppError(message, 400);
    }
    throw new AppError("Validation failed", 400, result.error.issues);
  }

  return result.data;
}

export async function readJsonBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<T> {
  const json = await parseJson(req);
  return parseSchema(schema, json);
}
