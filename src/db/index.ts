import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import type { BatchItem } from "drizzle-orm/batch";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | undefined;

export function getDb() {
  if (database) return database;

  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_CONNECTION_URL is not configured");
  }

  if (!url.startsWith("file:") && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN is not configured");
  }

  const client = createClient({ url, authToken });
  database = drizzle(client, { schema });

  return database;
}

export type SqliteBatchQuery = BatchItem<"sqlite">;

export function asBatch(
  queries: SqliteBatchQuery[],
): [SqliteBatchQuery, ...SqliteBatchQuery[]] {
  if (queries.length === 0) {
    throw new Error("db.batch requires at least one query");
  }

  return queries as [SqliteBatchQuery, ...SqliteBatchQuery[]];
}
