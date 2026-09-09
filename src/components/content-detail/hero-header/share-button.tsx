"use client";

import { ExternalLink, Link, Share2 } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";

type ShareButtonProps = {
  id?: number;
  imdbId?: string | null;
  type?: "movie" | "series";
};

export function ShareButton({ id, imdbId, type }: ShareButtonProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    setIsOpen(false);

    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage("Link copied. You can share it now.");
    } catch {
      setToastMessage("Unable to copy the link. Please copy the URL manually.");
    }
  };

  const tmdbUrl =
    id !== undefined
      ? `https://www.themoviedb.org/${type === "series" ? "tv" : "movie"}/${id}`
      : null;
  const imdbUrl = imdbId?.trim()
    ? `https://www.imdb.com/title/${imdbId.trim()}/`
    : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <button
            type="button"
            aria-label="Share title"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface-container text-slate-200 transition hover:bg-surface-container-high"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-xs border border-outline-alt bg-surface-container text-on-surface">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-semibold font-noto-sans text-accent">
              Share title
            </DialogTitle>
            <DialogDescription className="text-secondary text-xs">
              Choose where you want to view or share this title.
            </DialogDescription>
          </DialogHeader>

          <div className="-mx-4 flex flex-col">
            <button
              type="button"
              disabled={!tmdbUrl}
              onClick={() => {
                if (tmdbUrl) {
                  window.open(tmdbUrl, "_blank", "noopener,noreferrer");
                  setIsOpen(false);
                }
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary-container/15">
                <ExternalLink className="size-4 text-brand-primary" />
              </span>
              <span className="flex flex-col items-start">
                <span className="font-medium">TMDB page</span>
                <span className="text-xs text-secondary">
                  View on TheMovieDB
                </span>
              </span>
            </button>

            <button
              type="button"
              disabled={!imdbUrl}
              onClick={() => {
                if (imdbUrl) {
                  window.open(imdbUrl, "_blank", "noopener,noreferrer");
                  setIsOpen(false);
                }
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                <ExternalLink className="size-4 text-amber-400" />
              </span>
              <span className="flex flex-col items-start">
                <span className="font-medium">IMDb page</span>
                <span className="text-xs text-secondary">View on IMDb</span>
              </span>
            </button>

            <div className="mx-4 border-t border-white/5" />

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-white/5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-info/15">
                <Link className="size-4 text-status-info" />
              </span>
              <span className="flex flex-col items-start">
                <span className="font-medium">Copy link</span>
                <span className="text-xs text-secondary">
                  Copy to clipboard
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </>
  );
}

export default ShareButton;
