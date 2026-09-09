"use client";

import { Link, Share2 } from "lucide-react";
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

const TMDB_LOGO_URL = "/tmdb_logo.svg";
const IMDB_LOGO_URL = "/imdb_logo.svg";

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

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              type="button"
              disabled={!tmdbUrl}
              onClick={() => {
                if (tmdbUrl) {
                  window.open(tmdbUrl, "_blank", "noopener,noreferrer");
                  setIsOpen(false);
                }
              }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-on-surface transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
            >
              <img
                src={TMDB_LOGO_URL}
                alt="TMDB Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-medium text-xs">TMDB</span>
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
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-on-surface transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
            >
              <img
                src={IMDB_LOGO_URL}
                alt="IMDB Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-medium text-xs">IMDb</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-on-surface transition hover:bg-white/10"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-info/15">
                <Link className="size-4 text-status-info" />
              </span>
              <span className="font-medium text-xs">Copy link</span>
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
