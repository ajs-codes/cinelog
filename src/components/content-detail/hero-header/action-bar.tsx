"use client";

import { BookmarkPlus, Check, Heart, ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReactionButton } from "@/components/content-detail/hero-header/reaction-button";
import { ShareButton } from "@/components/content-detail/hero-header/share-button";
import { ProgressStatus } from "@/components/content-detail/progress/progress-status";
import { IMPRESSION } from "@/lib/constants";
import {
  canUpdateMovieWatchActivity,
  canUpdateSeriesWatchActivity,
} from "@/lib/media/status";
import type { MovieDetails, SeriesDetails } from "@/lib/types";
import { orFallback } from "@/lib/utils";
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
  0: { icon: ThumbsDown, iconClassName: "text-outline-muted" },
  1: { icon: ThumbsUp, iconClassName: "" },
  2: { icon: Heart, iconClassName: "text-status-error" },
} as const;

export function ActionBar({
  id,
  imdbId,
  type,
  isPresentInWatchlist = false,
  impression = null,
  watchStatus = null,
  mutationStatus = "idle",
  content,
}: ActionBarProps) {
  const dispatch = useAppDispatch();
  const tmdbId = id !== undefined ? id : "N/A";
  const displayImdbId = orFallback(imdbId);
  const isMutating = mutationStatus === "loading";
  const canUpdateWatchActivity =
    type === "movie"
      ? canUpdateMovieWatchActivity(content?.status)
      : type === "series"
        ? canUpdateSeriesWatchActivity(content?.status)
        : false;

  const requestMutation = (
    mutation: ContentMutation,
    value?: number | null,
  ) => {
    if (id === undefined || !type || isMutating) return;
    if (mutation !== "add-watchlist" && !isPresentInWatchlist) return;
    if (mutation !== "add-watchlist" && !canUpdateWatchActivity) {
      return;
    }
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

        <ShareButton id={id} imdbId={imdbId} type={type} />

        <div className="mx-1 h-6 w-px bg-white/15" />

        {type === "movie" && (
          <ProgressStatus
            id={id}
            type="movie"
            watchStatus={watchStatus}
            mutationStatus={mutationStatus}
            disabled={!isPresentInWatchlist || !canUpdateWatchActivity}
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
                disabled={
                  !isPresentInWatchlist || isMutating || !canUpdateWatchActivity
                }
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
      </div>
    </div>
  );
}

export default ActionBar;
