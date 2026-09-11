import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        className="text-sm font-medium text-secondary"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
      {error}
      {hint ? (
        <p className="font-public-sans text-[11px] text-secondary">{hint}</p>
      ) : null}
    </div>
  );
}
