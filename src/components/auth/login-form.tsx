"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginRequest } from "@/store/slices/authSlice";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
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
    <div className="flex w-full flex-col gap-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl text-on-surface sm:text-3xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-outline-muted">
          Sign in to your account
        </p>
      </div>

      {error ? <AlertBanner message={error} variant="error" /> : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={
            errors.username ? (
              <span className="text-xs text-status-error">
                {errors.username.message}
              </span>
            ) : null
          }
          id="username"
          label="Username"
        >
          <Input
            {...register("username")}
            className="h-10 border-white/10 bg-surface-container px-3 py-2"
            id="username"
            placeholder="username"
          />
        </FormField>

        <FormField
          error={
            errors.password ? (
              <span className="text-xs text-status-error">
                {errors.password.message}
              </span>
            ) : null
          }
          id="password"
          label="Password"
        >
          <Input
            {...register("password")}
            className="h-10 border-white/10 bg-surface-container px-3 py-2"
            id="password"
            placeholder="••••••••"
            type="password"
          />
        </FormField>

        <Button
          className="mt-2 h-10 w-full"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-outline-muted">
        {"Don't"} have an account?{" "}
        <Link className="text-brand-primary hover:underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
