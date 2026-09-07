import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-outline-alt bg-surface/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-primary text-surface">
          <span className="font-public-sans text-sm font-bold">C</span>
        </div>
        <span className="font-heading text-lg font-semibold text-on-surface">
          CineLog
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 font-public-sans text-xs text-outline-muted lg:flex">
          <span>Auto Synced</span>
          <span>.</span>
          <span>TMDB Connected</span>
        </div>

        <Button
          aria-label="Refresh TMDB data"
          className="hidden size-9 rounded-lg text-secondary hover:text-on-surface sm:inline-flex"
          size="icon"
          variant="dark"
          type="button"
        >
          <RotateCw className="size-4.25" strokeWidth={1.8} />
        </Button>
      </div>
    </header>
  );
}
