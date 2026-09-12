"use client";

import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAppSelector, useAppDispatch } from "@/store";
import { logoutRequest } from "@/store/slices/authSlice";

export function Navbar() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, status } = useAppSelector(
    (state) => state.auth,
  );

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-alt bg-surface/90 px-3.5 backdrop-blur-xl sm:px-8">
      {/* Mobile & Tab: App Logo & Title in Center */}
      <div className="flex w-full items-center justify-center lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-primary text-brand-on-primary shadow-xs">
            <Clapperboard className="size-4.5" strokeWidth={2.2} />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-on-surface">
            CineLog
          </span>
        </Link>
      </div>

      {/* Desktop: Right-aligned ThemeToggle and User Actions */}
      <div className="ml-auto hidden items-center gap-4 lg:flex">
        <ThemeToggle />
        {isAuthenticated && user && (
          <div className="flex items-center gap-3">
            <Button
              variant="dark"
              onClick={handleLogout}
              className="hover:bg-status-error/80! px-4 py-2 text-sm"
              disabled={status === "loading"}
            >
              Logout
            </Button>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-on-surface">
                {user.displayName || user.username}
              </span>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-container text-white border border-outline-alt shadow-sm">
                <span className="text-xs font-bold uppercase">
                  {(user.displayName || user.username).charAt(0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
