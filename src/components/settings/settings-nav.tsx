"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SETTINGS_NAV_GROUPS } from "@/lib/constants/settings";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-5">
      {SETTINGS_NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 font-public-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-outline-muted">
            {group.label}
          </p>
          {group.items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-11 items-center justify-between gap-3 rounded-lg px-3 font-public-sans text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-primary-container/20 text-brand-primary"
                    : "text-secondary hover:bg-surface-container-high hover:text-on-surface",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="size-4.5 shrink-0" strokeWidth={1.8} />
                  {label}
                </span>
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-brand-primary" : "text-secondary",
                  )}
                  strokeWidth={1.8}
                />
              </Link>
            );
          })}
        </div>
      ))}
      <div
        className="border-b border-outline-alt lg:hidden"
        aria-hidden="true"
      />
    </nav>
  );
}
