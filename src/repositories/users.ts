import { eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import type { NewUser } from "@/db/schema";

export async function findUserByUsername(username: string) {
  return getDb().query.users.findFirst({
    where: eq(users.username, username),
  });
}

export async function findUserByUsernameOrEmail(
  username: string,
  email: string,
) {
  return getDb().query.users.findFirst({
    where: or(eq(users.username, username), eq(users.email, email)),
  });
}

export async function findUserById(id: number) {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function findUserByEmail(email: string) {
  return getDb().query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function insertUser(values: NewUser) {
  const [user] = await getDb().insert(users).values(values).returning();
  return user;
}

export async function updateUser(id: number, values: Partial<NewUser>) {
  const [user] = await getDb()
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning();
  return user;
}
