export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-3 sm:p-4">
      <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-outline-variant bg-surface-container-low p-5 sm:p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
