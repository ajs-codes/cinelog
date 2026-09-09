import { z } from "zod";

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(6, "Password must be at least 6 characters")
  .max(20, "Password cannot exceed 20 characters")
  .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Must contain at least 1 number")
  .regex(/[@#&!_]/, "Must contain at least 1 symbol (@, #, &, !)")
  .regex(
    /^[a-zA-Z0-9@#&!_]+$/,
    "Only alphanumeric and @, #, &, ! symbols are allowed",
  );

export const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(10, "Username cannot exceed 10 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: passwordSchema,
  displayName: z.string().optional(),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(10, "Username cannot exceed 10 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(10, "Username cannot exceed 10 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  displayName: z.string().nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
