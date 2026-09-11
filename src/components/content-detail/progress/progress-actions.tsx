"use client";

import { Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContentMutation } from "@/hooks/title-details/use-content-mutation";
import type {
  ContentMutationStatus,
  ContentMutation,
  ContentProgressMutation,
} from "@/store/slices/contentDetailsSlice";

type ProgressActionsProps = {
  disabled?: boolean;
  episodeCount?: number;
  episodesWatched?: number;
  id?: number;
  mutationStatus?: ContentMutationStatus;
  lastMutation?: ContentMutation;
  pendingProgress?: ContentProgressMutation;
  seasonNumber?: number;
};

export function ProgressActions({
  disabled = false,
  episodeCount = 0,
  episodesWatched = 0,
  id,
  mutationStatus = "idle",
  lastMutation,
  pendingProgress,
  seasonNumber = 1,
}: ProgressActionsProps) {
  const { requestMutation, isMutating } = useContentMutation({
    id,
    mediaType: "series",
    mutationStatus,
  });
  const isComplete = episodeCount <= 0 || episodesWatched >= episodeCount;
  const isDisabled = disabled || id === undefined || isMutating || isComplete;
  const nextEpisode = Math.min(episodesWatched + 1, episodeCount);
  const isEpisodeMutating =
    isMutating &&
    lastMutation === "update-progress" &&
    pendingProgress?.episodeNumber === nextEpisode;
  const isSeasonMutating =
    isMutating &&
    lastMutation === "update-progress" &&
    pendingProgress?.episodeNumber === episodeCount;

  function updateProgress(episodeNumber: number) {
    if (isDisabled) return;
    requestMutation("update-progress", {
      progress: { seasonNumber, episodeNumber },
      requireWatchlist: false,
      requireWatchActivity: false,
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Button
        className="h-12 justify-center gap-2 rounded-xl border border-brand-primary-container/40 bg-brand-primary-container px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-brand-primary-container/90 sm:h-14 sm:text-base"
        disabled={isDisabled}
        onClick={() => updateProgress(nextEpisode)}
        type="button"
        variant="primaryFilled"
      >
        {isEpisodeMutating ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {isEpisodeMutating
          ? "Updating Episode..."
          : `Mark Ep ${nextEpisode || 1} Watched`}
      </Button>

      <Button
        className="h-12 justify-center gap-2 rounded-xl border border-white/10 bg-surface-container-high/70 px-4 text-sm font-semibold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high sm:h-14 sm:text-base"
        disabled={isDisabled}
        onClick={() => updateProgress(episodeCount)}
        type="button"
        variant="darkFilled"
      >
        {isSeasonMutating ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-tertiary-accent-alt" />
        ) : (
          <CheckCheck className="h-4 w-4 text-brand-tertiary-accent-alt" />
        )}
        {isSeasonMutating
          ? "Marking Season Watched..."
          : `Mark Season ${seasonNumber} Watched`}
      </Button>
    </div>
  );
}

export default ProgressActions;
