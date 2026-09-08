"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, LayoutDashboard, Library, Settings } from "lucide-react";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "My library", href: "/library", icon: Library },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-58 shrink-0 border-r border-outline-alt bg-surface-container-low lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-outline-alt px-7">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-surface">
          <Clapperboard className="size-5" strokeWidth={2.2} />
        </div>
        <span className="font-heading text-xl font-semibold tracking-tight text-on-surface">
          CineLog
        </span>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-4 py-8"
        aria-label="Main navigation"
      >
        <p className="px-3 pb-3 font-public-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-outline-muted">
          Workspace
        </p>
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 font-public-sans text-sm transition-colors ${
                active
                  ? "bg-brand-primary-container/20 font-semibold text-brand-primary"
                  : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4.5" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
