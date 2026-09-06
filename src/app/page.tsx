import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-text-secondary">
        CineLog
      </p>

      <h1 className="text-4xl font-semibold tracking-tight text-text-on-surface">
        Your movie log starts here.
      </h1>

      <p className="max-w-md text-text-secondary">
        A Next.js foundation with typed API routes, Zod validation, Drizzle, and
        Redux Saga.
      </p>

      <Link
        className="rounded-lg bg-brand-primary-container px-4 py-2 text-white"
        href="/dashboard"
      >
        Open dashboard
      </Link>
    </main>
  );
}
