"use client";

import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactionButton } from "@/components/content-detail/hero-header/reaction-button";
import { ShareButton } from "@/components/content-detail/hero-header/share-button";
import { ProgressStatus } from "@/components/content-detail/progress/progress-status";
import { useContentMutation } from "@/hooks/title-details/use-content-mutation";
import { IMPRESSION, IMPRESSION_CONFIG } from "@/lib/constants";
import type { MovieDetails, SeriesDetails } from "@/lib/types";
import { orFallback } from "@/lib/utils";
import type {
  ContentMutationStatus,
  ContentMutation,
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
  lastMutation?: ContentMutation;
  pendingValue?: number | null;
  content?: MovieDetails | SeriesDetails;
};

export function ActionBar({
  id,
  imdbId,
  type,
  isPresentInWatchlist = false,
  impression = null,
  watchStatus = null,
  mutationStatus = "idle",
  lastMutation,
  pendingValue,
  content,
}: ActionBarProps) {
  const tmdbId = id !== undefined ? id : "N/A";
  const displayImdbId = orFallback(imdbId);
  const { requestMutation, isMutating, canUpdateWatchActivity } =
    useContentMutation({
      id,
      mediaType: type,
      mutationStatus,
      isPresentInWatchlist,
      content,
    });
  const isAddingWatchlist = isMutating && lastMutation === "add-watchlist";

  return (
    <div className="mt-6 border-t border-outline-variant pt-4">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <Button
          className="h-10 gap-2 rounded-lg border border-outline-variant bg-surface-container px-3.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high! sm:px-4 sm:text-sm"
          disabled={isMutating || isPresentInWatchlist}
          onClick={() => requestMutation("add-watchlist")}
          type="button"
          variant="darkFilled"
        >
          {isAddingWatchlist ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
          ) : isPresentInWatchlist ? (
            <Check className="h-4 w-4 text-status-success" />
          ) : (
            <BookmarkPlus className="h-4 w-4" />
          )}
          {isAddingWatchlist
            ? "Adding..."
            : isPresentInWatchlist
              ? "In Watchlist"
              : "Add to Watchlist"}
        </Button>

        <ShareButton id={id} imdbId={imdbId} type={type} />

        <div className="mx-1 hidden h-6 w-px bg-outline-variant sm:block" />

        {type === "movie" && (
          <ProgressStatus
            disabled={!isPresentInWatchlist || !canUpdateWatchActivity}
            id={id}
            lastMutation={lastMutation}
            mutationStatus={mutationStatus}
            type="movie"
            watchStatus={watchStatus}
          />
        )}

        <div className="inline-flex items-center gap-1 rounded-xl border border-outline-variant bg-surface-container/70 p-1">
          {Object.values(IMPRESSION).map((imp) => {
            const config =
              IMPRESSION_CONFIG[imp.value as keyof typeof IMPRESSION_CONFIG];
            const isActive = impression === imp.value;
            const isThisImpressionMutating =
              isMutating &&
              lastMutation === "update-impression" &&
              (pendingValue === imp.value ||
                (pendingValue === null && isActive));

            return (
              <ReactionButton
                active={isActive}
                className={isActive ? "text-brand-primary" : "text-on-surface"}
                disabled={
                  !isPresentInWatchlist || isMutating || !canUpdateWatchActivity
                }
                icon={config.icon}
                iconClassName={
                  isActive && config.className ? config.className : ""
                }
                key={imp.value}
                label={imp.display_value}
                loading={isThisImpressionMutating}
                onClick={() =>
                  requestMutation("update-impression", {
                    value: isActive ? null : imp.value,
                  })
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
