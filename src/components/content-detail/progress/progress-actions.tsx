"use client";

import { Check, CheckCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import {
  mutationRequested,
  type ContentMutationStatus,
  type ContentMutation,
  type ContentProgressMutation,
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
  const dispatch = useAppDispatch();
  const isComplete = episodeCount <= 0 || episodesWatched >= episodeCount;
  const isMutating = mutationStatus === "loading";
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
    if (isDisabled || id === undefined) return;

    dispatch(
      mutationRequested({
        id: String(id),
        mediaType: "series",
        mutation: "update-progress",
        progress: {
          seasonNumber,
          episodeNumber,
        },
      }),
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Button
        type="button"
        variant="primaryFilled"
        disabled={isDisabled}
        onClick={() => updateProgress(nextEpisode)}
        className="h-12 sm:h-14 justify-center gap-2 rounded-xl border border-brand-primary-container/40 bg-brand-primary-container px-4 text-sm sm:text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-brand-primary-container/90"
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
        type="button"
        variant="darkFilled"
        disabled={isDisabled}
        onClick={() => updateProgress(episodeCount)}
        className="h-12 sm:h-14 justify-center gap-2 rounded-xl border border-white/10 bg-surface-container-high/70 px-4 text-sm sm:text-base font-semibold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high"
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
