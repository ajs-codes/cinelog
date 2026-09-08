"use client";

import {
  BookmarkPlus,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReactionButton } from "@/components/content-detail/hero-header/reaction_button";
import { ProgressStatus } from "@/components/content-detail/progress/status";
import { IMPRESSION } from "@/lib/constants";
import type { MovieDetails, SeriesDetails } from "@/lib/types";
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
  mutationStatus = "idle",
  content,
}: ActionBarProps) {
  const dispatch = useAppDispatch();
  const tmdbId = id !== undefined ? id : "N/A";
  const displayImdbId = imdbId ?? "N/A";
  const displayLanguage = language
    ? (new Intl.DisplayNames(["en"], { type: "language" }).of(language) ??
      language)
    : "N/A";

  const isMutating = mutationStatus === "loading";

  const requestMutation = (
    mutation: ContentMutation,
    value?: number | null,
  ) => {
    if (id === undefined || !type || isMutating) return;
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

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={isMutating}
          onClick={() =>
            requestMutation(
              isPresentInWatchlist ? "remove-watchlist" : "add-watchlist",
            )
          }
          variant="darkFilled"
          className="h-10 gap-2 rounded-lg border border-white/10 bg-surface-container px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high!"
        >
          <BookmarkPlus className="h-4 w-4" />
          {isPresentInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </Button>

        <button
          type="button"
          aria-label="Share title"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface-container text-slate-200 transition hover:bg-surface-container-high"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-white/15" />

        {type === "movie" && <ProgressStatus type="movie" />}

        <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-container/70 p-1.5">
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

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-neutral">
        <span>TMDB ID: {tmdbId}</span>
        <span className="text-outline-muted">•</span>
        <span>IMDB ID: {displayImdbId}</span>
        <span className="text-outline-muted">•</span>
        <span>Language: {displayLanguage}</span>
      </div>
    </div>
  );
}

export default ActionBar;
