import type { ReactNode } from "react";

import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";

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
