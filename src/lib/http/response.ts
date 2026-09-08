import { NextResponse } from "next/server";
import { isAppError } from "@/lib/http/errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function fail(error: string, status: number, details?: unknown) {
  if (details !== undefined) {
    return NextResponse.json({ error, details }, { status });
  }

  return NextResponse.json({ error }, { status });
}

export function toErrorResponse(
  error: unknown,
  logLabel: string,
  fallbackMessage = "Internal server error",
) {
  if (isAppError(error)) {
    return fail(error.message, error.status, error.details);
  }

  console.error(logLabel, error);
  return fail(fallbackMessage, 500);
}
