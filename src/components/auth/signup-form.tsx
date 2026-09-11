"use client";

import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useAppDispatch, useAppSelector } from "@/store";
import { signupRequest } from "@/store/slices/authSlice";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

function ErrorList({ error }: { error?: FieldError }) {
  if (!error) return null;

  if (error.types) {
    const messages = Object.values(error.types).flat();
    return (
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-status-error">
        {messages.map((msg, idx) => (
          <li key={idx}>{String(msg)}</li>
        ))}
      </ul>
    );
  }

  return (
    <span className="mt-1 inline-block text-xs text-status-error">
      {error.message}
    </span>
  );
}

export function SignupForm() {
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
    <div className="flex w-full flex-col gap-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl text-on-surface sm:text-3xl">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-outline-muted">Join Cinelog today</p>
      </div>

      {error ? <AlertBanner message={error} variant="error" /> : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          error={<ErrorList error={errors.username} />}
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
          error={<ErrorList error={errors.email} />}
          id="email"
          label="Email"
        >
          <Input
            {...register("email")}
            className="h-10 border-white/10 bg-surface-container px-3 py-2"
            id="email"
            placeholder="email@example.com"
            type="email"
          />
        </FormField>

        <FormField
          error={<ErrorList error={errors.displayName} />}
          id="displayName"
          label={
            <>
              Display Name <span className="text-outline-muted">(Optional)</span>
            </>
          }
        >
          <Input
            {...register("displayName")}
            className="h-10 border-white/10 bg-surface-container px-3 py-2"
            id="displayName"
            placeholder="Enter your name"
          />
        </FormField>

        <FormField
          error={<ErrorList error={errors.password} />}
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
          {status === "loading" ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-center text-sm text-outline-muted">
        Already have an account?{" "}
        <Link className="text-brand-primary hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
