"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  LayoutDashboard,
  Library,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { libraryRequested } from "@/store/slices/librarySlice";

const subscribeToNothing = () => () => {};

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "My library", href: "/library", icon: Library, showCount: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { movies, series, status } = useAppSelector((state) => state.library);
  const hasMounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(libraryRequested());
    }
  }, [dispatch, status]);

  const libraryCount = movies.length + series.length;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-outline-alt bg-surface-container-low transition-transform duration-200 ease-out lg:z-30 lg:w-58 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-3 border-b border-outline-alt px-7">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-surface">
            <Clapperboard className="size-5" strokeWidth={2.2} />
          </div>
          <span className="font-heading text-xl font-semibold tracking-tight text-on-surface">
            CineLog
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="dark"
            aria-label="Close navigation"
            className="ml-auto lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 px-4 py-8"
          aria-label="Main navigation"
        >
          <p className="px-3 pb-3 font-public-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-outline-muted">
            Workspace
          </p>
          {navigation.map(({ label, href, icon: Icon, showCount }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 font-public-sans text-sm transition-colors ${
                  active
                    ? "bg-brand-primary-container/20 font-semibold text-brand-primary"
                    : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4.5" strokeWidth={1.8} />
                {label}
                {showCount && hasMounted ? (
                  <span
                    aria-label={`${libraryCount} titles in library`}
                    className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-brand-primary-container px-1.5 font-public-sans text-[10px] font-medium leading-none text-white"
                  >
                    {libraryCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
