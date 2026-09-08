"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useAppDispatch, useAppSelector } from "@/store";
import { signupRequest } from "@/store/slices/authSlice";

import { Button } from "@/components/ui/button";
import type { FieldError } from "react-hook-form";

const ErrorList = ({ error }: { error?: FieldError }) => {
  if (!error) return null;

  if (error.types) {
    const messages = Object.values(error.types).flat();
    return (
      <ul className="list-inside list-disc text-xs text-status-error space-y-0.5 mt-1">
        {messages.map((msg, idx) => (
          <li key={idx}>{String(msg)}</li>
        ))}
      </ul>
    );
  }

  return (
    <span className="text-xs text-status-error mt-1 inline-block">
      {error.message}
    </span>
  );
};

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    criteriaMode: "all",
  });

  const onSubmit = (data: SignupInput) => {
    dispatch(signupRequest(data));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl text-on-surface">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-outline-muted">Join Cinelog today</p>
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
            placeholder="username"
          />
          <ErrorList error={errors.username} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary" htmlFor="email">
            Email
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className="rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-on-surface focus:border-brand-primary focus:outline-none"
            placeholder="email@example.com"
          />
          <ErrorList error={errors.email} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium text-secondary"
            htmlFor="displayName"
          >
            Display Name <span className="text-outline-muted">(Optional)</span>
          </label>
          <input
            {...register("displayName")}
            id="displayName"
            className="rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-on-surface focus:border-brand-primary focus:outline-none"
            placeholder="Enter your name"
          />
          <ErrorList error={errors.displayName} />
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
          <ErrorList error={errors.password} />
        </div>

        <Button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 h-10 w-full"
        >
          {status === "loading" ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-center text-sm text-outline-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
