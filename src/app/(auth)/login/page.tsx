"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginRequest } from "@/store/slices/authSlice";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    dispatch(loginRequest(data));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl text-on-surface">Welcome Back</h1>
        <p className="mt-2 text-sm text-outline-muted">
          Sign in to your account
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-status-error/10 p-3 text-sm text-status-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-secondary"
            htmlFor="username"
          >
            Username
          </label>
          <input
            {...register("username")}
            id="username"
            className="rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-on-surface focus:border-brand-primary focus:outline-none"
            placeholder="johndoe"
          />
          {errors.username && (
            <span className="text-xs text-status-error">
              {errors.username.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-secondary"
            htmlFor="password"
          >
            Password
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            className="rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-on-surface focus:border-brand-primary focus:outline-none"
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="text-xs text-status-error">
              {errors.password.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 h-10 w-full"
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-outline-muted">
        {"Don't"} have an account?{" "}
        <Link href="/signup" className="text-brand-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
