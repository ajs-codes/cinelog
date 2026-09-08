import { compare, hash } from "bcryptjs";
import { AppError } from "@/lib/http/errors";
import { createSessionToken } from "@/lib/auth/session";
import type { LoginInput, SignupInput } from "@/lib/validations/auth";
import {
  findUserById,
  findUserByUsername,
  findUserByUsernameOrEmail,
  insertUser,
} from "@/repositories/users";

function toPublicUser(user: {
  id: number;
  username: string;
  displayName: string | null;
}) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByUsername(input.username);

  if (!user) {
    throw new AppError("Invalid username or password", 401);
  }

  const isPasswordValid = await compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid username or password", 401);
  }

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
  });

  return { token, publicUser: toPublicUser(user) };
}

export async function signupUser(input: SignupInput) {
  const existingUser = await findUserByUsernameOrEmail(
    input.username,
    input.email,
  );

  if (existingUser) {
    throw new AppError("Username or email already in use", 409);
  }

  const passwordHash = await hash(input.password, 10);
  const newUser = await insertUser({
    username: input.username,
    email: input.email,
    passwordHash,
    displayName: input.displayName || null,
  });

  const token = await createSessionToken({
    userId: newUser.id,
    username: newUser.username,
  });

  return { token, publicUser: toPublicUser(newUser) };
}

export async function getCurrentUser(userId: number) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toPublicUser(user);
}
