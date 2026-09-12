"use client";

import { Link, Share2 } from "lucide-react";
import Image from "next/image";
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
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { IMDB_LOGO_URL, TMDB_LOGO_URL } from "@/lib/constants";

type ShareButtonProps = {
  id?: number;
  imdbId?: string | null;
  type?: "movie" | "series";
};

export function ShareButton({ id, imdbId, type }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { message, copy, clear } = useCopyToClipboard();

  const tmdbUrl =
    id !== undefined
      ? `https://www.themoviedb.org/${type === "series" ? "tv" : "movie"}/${id}`
      : null;
  const imdbUrl = imdbId?.trim()
    ? `https://www.imdb.com/title/${imdbId.trim()}/`
    : null;

  return (
    <>
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger>
          <button
            aria-label="Share title"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface transition hover:bg-surface-container-high"
            type="button"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-xs border border-outline-alt bg-surface-container text-on-surface">
          <DialogHeader className="pr-8">
            <DialogTitle className="font-noto-sans text-lg font-semibold text-on-surface">
              Share title
            </DialogTitle>
            <DialogDescription className="text-xs text-secondary">
              Choose where you want to view or share this title.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <button
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-high p-3 text-sm text-on-surface transition hover:bg-surface-container-highest disabled:pointer-events-none disabled:opacity-40"
              disabled={!tmdbUrl}
              onClick={() => {
                if (tmdbUrl) {
                  window.open(tmdbUrl, "_blank", "noopener,noreferrer");
                  setIsOpen(false);
                }
              }}
              type="button"
            >
              <Image
                alt="TMDB Logo"
                className="h-8 w-auto object-contain"
                height={32}
                src={TMDB_LOGO_URL}
                width={48}
              />
              <span className="text-xs font-medium">TMDB</span>
            </button>

            <button
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-high p-3 text-sm text-on-surface transition hover:bg-surface-container-highest disabled:pointer-events-none disabled:opacity-40"
              disabled={!imdbUrl}
              onClick={() => {
                if (imdbUrl) {
                  window.open(imdbUrl, "_blank", "noopener,noreferrer");
                  setIsOpen(false);
                }
              }}
              type="button"
            >
              <Image
                alt="IMDB Logo"
                className="h-8 w-auto object-contain"
                height={32}
                src={IMDB_LOGO_URL}
                width={48}
              />
              <span className="text-xs font-medium">IMDb</span>
            </button>

            <button
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-high p-3 text-sm text-on-surface transition hover:bg-surface-container-highest"
              onClick={() => {
                setIsOpen(false);
                void copy(
                  window.location.href,
                  "Link copied. You can share it now.",
                  "Unable to copy the link. Please copy the URL manually.",
                );
              }}
              type="button"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-status-info/15">
                <Link className="size-4 text-status-info" />
              </span>
              <span className="text-xs font-medium">Copy link</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {message ? <Toast message={message} onDismiss={clear} /> : null}
    </>
  );
}

export default ShareButton;
