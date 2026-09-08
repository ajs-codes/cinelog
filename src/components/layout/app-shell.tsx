import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-58">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
