"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useProgressStatus } from "@/hooks/title-details/use-progress-status";
import type { SeriesDetails, BadgeIndicator } from "@/lib/types";
import { WATCH_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  mutationRequested,
  type ContentMutationStatus,
} from "@/store/slices/contentDetailsSlice";

const indicatorClasses: Record<BadgeIndicator, string> = {
  success: "bg-status-success",
  info: "bg-status-info",
  error: "bg-status-error",
  accentAlt: "bg-brand-tertiary-accent-alt",
};

const WATCH_STATUS_INDICATOR: Record<number, BadgeIndicator> = {
  0: "info",
  1: "accentAlt",
  2: "success",
  3: "error",
};

type ProgressStatusProps = {
  id?: number;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
  watchStatus?: number | null;
  mutationStatus?: ContentMutationStatus;
  disabled?: boolean;
};

export function ProgressStatus({
  id,
  series,
  type = "series",
  watchStatus = 0,
  mutationStatus = "idle",
  disabled = false,
}: ProgressStatusProps) {
  const dispatch = useAppDispatch();
  const { episodeCount, seasonCount } = useProgressStatus(series);
  const [isOpen, setIsOpen] = useState(false);
  const status = watchStatus ?? 0;
  const isMutating = mutationStatus === "loading";
  const isDisabled = disabled || isMutating;
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (isDisabled && isOpen) {
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStatusObj =
    WATCH_STATUS[status as keyof typeof WATCH_STATUS] ?? WATCH_STATUS[1];
  const currentIndicator = WATCH_STATUS_INDICATOR[status] ?? "accentAlt";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-surface-container-high/70 px-3.5 py-2.5 text-sm text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              indicatorClasses[currentIndicator],
            )}
          />
          <span className="font-medium">{currentStatusObj.display_value}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-outline-muted transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-45 rounded-xl border border-outline-alt bg-surface-container shadow-[0_8px_24px_rgb(0_0_0/25%)] z-50 overflow-hidden">
            <div className="flex flex-col py-1.5">
              {Object.values(WATCH_STATUS).map((ws) => {
                const isSelected = ws.value === status;
                const ind = WATCH_STATUS_INDICATOR[ws.value];
                return (
                  <button
                    key={ws.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      setIsOpen(false);
                      if (id === undefined || isDisabled || ws.value === status)
                        return;
                      dispatch(
                        mutationRequested({
                          id: String(id),
                          mediaType: type,
                          mutation: "update-watch-status",
                          value: ws.value,
                        }),
                      );
                    }}
                    className={cn(
                      "inline-flex items-center justify-between px-3.5 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left",
                      isSelected && "bg-surface-container-high",
                    )}
                  >
                    <div className="inline-flex items-center gap-3">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          indicatorClasses[ind],
                        )}
                      />
                      <span className="font-medium">{ws.display_value}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-brand-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {type === "series" ? (
        <div className="flex flex-wrap items-center gap-3">
          <ProgressMetadata label="SEASON" value={`1 of ${seasonCount}`} />
          <ProgressMetadata label="EPISODE" value={`0 of ${episodeCount}`} />
        </div>
      ) : null}
    </div>
  );
}

function ProgressMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-high/70 px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-secondary uppercase">
      <span className="text-outline-muted">{label}</span>
      <span className="text-on-surface">{value}</span>
    </div>
  );
}

export default ProgressStatus;
