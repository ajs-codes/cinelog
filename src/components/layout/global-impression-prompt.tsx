"use client";

import { useState } from "react";
import { ReactionButton } from "@/components/content-detail/hero-header/reaction-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IMPRESSION, IMPRESSION_CONFIG } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/store";
import { mutationRequested } from "@/store/slices/contentDetailsSlice";
import { impressionPromptSubmitting } from "@/store/slices/impressionPromptSlice";
import { libraryItemMutationRequested } from "@/store/slices/librarySlice";

export function GlobalImpressionPrompt() {
  const dispatch = useAppDispatch();
  const { target, status, error } = useAppSelector(
    (state) => state.impressionPrompt,
  );
  const [pending, setPending] = useState<{ key: string; value: number } | null>(
    null,
  );
  const isSubmitting = status === "submitting";
  const targetKey = target
    ? `${target.mediaType}-${target.tmdbId}-${target.reason}-${target.seasonNumber ?? ""}`
    : null;
  const pendingValue = pending?.key === targetKey ? pending.value : null;

  if (!target) {
    return null;
  }

  const heading =
    target.reason === "season-completed"
      ? `Season ${target.seasonNumber} of ${target.title} done. How was it?`
      : `How was ${target.title}?`;

  function choose(value: number) {
    if (!target || isSubmitting) {
      return;
    }

    setPending(targetKey ? { key: targetKey, value } : null);
    dispatch(impressionPromptSubmitting());

    if (target.source === "library") {
      dispatch(
        libraryItemMutationRequested({
          mediaType: target.mediaType,
          tmdbId: target.tmdbId,
          title: target.title,
          impression: value,
        }),
      );
      return;
    }

    dispatch(
      mutationRequested({
        id: String(target.tmdbId),
        mediaType: target.mediaType,
        mutation: "update-impression",
        value,
      }),
    );
  }

  return (
    <Dialog open>
      <DialogContent
        className="w-full sm:max-w-sm"
        dismissible={false}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="pr-2 text-base leading-snug">
            {heading}
          </DialogTitle>
          <DialogDescription>
            What&apos;s your opinion?
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 flex-row gap-2">
          {Object.values(IMPRESSION).map((impression) => {
            const config =
              IMPRESSION_CONFIG[impression.value as keyof typeof IMPRESSION_CONFIG];

            return (
              <ReactionButton
                active={pendingValue === impression.value && isSubmitting}
                className="min-w-0 flex-1 justify-center"
                disabled={isSubmitting}
                icon={config.icon}
                key={impression.value}
                label={impression.display_value}
                labelClassName="sr-only sm:not-sr-only"
                loading={pendingValue === impression.value && isSubmitting}
                onClick={() => choose(impression.value)}
              />
            );
          })}
        </div>
        {status === "failed" && error ? (
          <p className="text-sm text-status-error">{error}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
