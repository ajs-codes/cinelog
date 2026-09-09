"use client";

import { Menu, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store";
import { logoutRequest } from "@/store/slices/authSlice";

type NavbarProps = {
  onMenuOpen: () => void;
};

export function Navbar({ onMenuOpen }: NavbarProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, status } = useAppSelector(
    (state) => state.auth,
  );

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-alt bg-surface/90 px-5 backdrop-blur-xl sm:px-8">
      <Button
        aria-label="Open navigation"
        className="size-9 rounded-lg text-secondary hover:text-on-surface lg:hidden"
        size="icon"
        variant="dark"
        type="button"
        onClick={onMenuOpen}
      >
        <Menu className="size-4.5" strokeWidth={1.8} />
      </Button>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {isAuthenticated && user && (
          <div className="flex items-center gap-3">
            <Button
              variant="dark"
              onClick={handleLogout}
              className="hover:bg-status-error/80! py-4"
              disabled={status === "loading"}
            >
              Logout
            </Button>
            <div className="flex items-center gap-2.5">
              <span className="hidden text-sm font-semibold text-on-surface sm:block">
                {user.displayName || user.username}
              </span>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-container text-white border border-white/10 shadow-sm">
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
