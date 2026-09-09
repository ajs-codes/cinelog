"use client";

import {
  BookmarkPlus,
  Check,
  Copy,
  ExternalLink,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactionButton } from "@/components/content-detail/hero-header/reaction-button";
import { ProgressStatus } from "@/components/content-detail/progress/progress-status";
import { Toast } from "@/components/ui/toast";
import { IMPRESSION } from "@/lib/constants";
import type { MovieDetails, SeriesDetails } from "@/lib/types";
import { formatLanguage, orFallback } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  mutationRequested,
  type ContentMutationStatus,
  type ContentMutation,
} from "@/store/slices/contentDetailsSlice";

type ActionBarProps = {
  id?: number;
  imdbId?: string | null;
  language?: string | null;
  type?: "movie" | "series";
  isPresentInWatchlist?: boolean;
  impression?: number | null;
  watchStatus?: number | null;
  mutationStatus?: ContentMutationStatus;
  content?: MovieDetails | SeriesDetails;
};

const IMPRESSION_CONFIG = {
  0: { icon: ThumbsDown, iconClassName: "" }, // Dislike
  1: { icon: ThumbsUp, iconClassName: "" }, // Like
  2: { icon: Heart, iconClassName: "fill-status-error text-status-error" }, // Love
} as const;

export function ActionBar({
  id,
  imdbId,
  language,
  type,
  isPresentInWatchlist = false,
  impression = null,
  watchStatus = null,
  mutationStatus = "idle",
  content,
}: ActionBarProps) {
  const dispatch = useAppDispatch();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const tmdbId = id !== undefined ? id : "N/A";
  const displayImdbId = orFallback(imdbId);
  const displayLanguage = language?.trim() ? formatLanguage(language) : "N/A";

  const isMutating = mutationStatus === "loading";

  const requestMutation = (
    mutation: ContentMutation,
    value?: number | null,
  ) => {
    if (id === undefined || !type || isMutating) return;
    if (mutation !== "add-watchlist" && !isPresentInWatchlist) return;
    dispatch(
      mutationRequested({
        id: String(id),
        mediaType: type,
        mutation,
        value,
        content,
      }),
    );
  };

  const handleCopyLink = async () => {
    setIsShareDialogOpen(false);

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
    <div className="mt-6 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={isMutating || isPresentInWatchlist}
          onClick={() => requestMutation("add-watchlist")}
          variant="darkFilled"
          className="h-10 gap-2 rounded-lg border border-white/10 bg-surface-container px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high!"
        >
          {isPresentInWatchlist ? (
            <Check className="h-4 w-4 text-status-success" />
          ) : (
            <BookmarkPlus className="h-4 w-4" />
          )}
          {isPresentInWatchlist ? "In Watchlist" : "Add to Watchlist"}
        </Button>

        <button
          type="button"
          aria-label="Share title"
          onClick={() => setIsShareDialogOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface-container text-slate-200 transition hover:bg-surface-container-high"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-white/15" />

        {type === "movie" && (
          <ProgressStatus
            id={id}
            type="movie"
            watchStatus={watchStatus}
            mutationStatus={mutationStatus}
            disabled={!isPresentInWatchlist}
          />
        )}

        <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-surface-container/70 p-1">
          {Object.values(IMPRESSION).map((imp) => {
            const config =
              IMPRESSION_CONFIG[imp.value as keyof typeof IMPRESSION_CONFIG];
            const isActive = impression === imp.value;

            return (
              <ReactionButton
                key={imp.value}
                icon={config.icon}
                iconClassName={
                  isActive && config.iconClassName ? config.iconClassName : ""
                }
                label={imp.display_value}
                active={isActive}
                disabled={!isPresentInWatchlist || isMutating}
                className={isActive ? "text-white" : "text-on-surface"}
                onClick={() =>
                  requestMutation(
                    "update-impression",
                    isActive ? null : imp.value,
                  )
                }
              />
            );
          })}
        </div>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-sm border border-outline-alt bg-surface-container text-on-surface">
          <DialogHeader className="pr-8">
            <DialogTitle>Share title</DialogTitle>
            <DialogDescription className="text-secondary">
              Choose where you want to view or share this title.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="darkFilled"
              className="justify-start gap-3 border-outline-alt text-on-surface"
              disabled={!tmdbUrl}
              onClick={() => {
                if (tmdbUrl) {
                  window.open(tmdbUrl, "_blank", "noopener,noreferrer");
                  setIsShareDialogOpen(false);
                }
              }}
            >
              <ExternalLink className="size-4 text-brand-primary" />
              TMDB page
            </Button>
            <Button
              type="button"
              variant="darkFilled"
              className="justify-start gap-3 border-outline-alt text-on-surface"
              disabled={!imdbUrl}
              onClick={() => {
                if (imdbUrl) {
                  window.open(imdbUrl, "_blank", "noopener,noreferrer");
                  setIsShareDialogOpen(false);
                }
              }}
            >
              <ExternalLink className="size-4 text-brand-primary" />
              IMDb page
            </Button>
            <DialogClose
              type="button"
              variant="darkFilled"
              className="justify-start gap-3 border-outline-alt text-on-surface"
              onClick={handleCopyLink}
            >
              <Copy className="size-4 text-status-info" />
              Copy link
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-neutral">
        <span>TMDB ID: {tmdbId}</span>
        <span className="text-outline-muted">•</span>
        <span>IMDB ID: {displayImdbId}</span>
        <span className="text-outline-muted">•</span>
        <span>Language: {displayLanguage}</span>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export default ActionBar;
