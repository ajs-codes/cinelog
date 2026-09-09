"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { SeasonSelect } from "@/components/content-detail/progress/season-select";
import type { SeasonOption } from "@/hooks/title-details/use-progress-seasons";
import { useProgressStatus } from "@/hooks/title-details/use-progress-status";
import type { SeriesDetails } from "@/lib/types";
import { WATCH_STATUS } from "@/lib/constants";
import {
  WATCH_STATUS_ICONS,
  WATCH_STATUS_INDICATOR,
  WATCH_STATUS_INDICATOR_TEXT,
} from "@/lib/media/watch-status";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  mutationRequested,
  type ContentMutationStatus,
} from "@/store/slices/contentDetailsSlice";

type ProgressStatusProps = {
  id?: number;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
  watchStatus?: number | null;
  mutationStatus?: ContentMutationStatus;
  disabled?: boolean;
  seasons?: SeasonOption[];
  selectedSeason?: number;
  onSeasonChange?: (seasonNumber: number) => void;
};

export function ProgressStatus({
  id,
  series,
  type = "series",
  watchStatus = 0,
  mutationStatus = "idle",
  disabled = false,
  seasons = [],
  selectedSeason,
  onSeasonChange,
}: ProgressStatusProps) {
  const dispatch = useAppDispatch();
  const { episodeCount } = useProgressStatus(series);
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
  const CurrentStatusIcon =
    WATCH_STATUS_ICONS[status as keyof typeof WATCH_STATUS_ICONS] ??
    WATCH_STATUS_ICONS[0];
  const currentSeason = seasons.find(
    (season) => season.seasonNumber === selectedSeason,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-surface-container-high/70 px-3.5 py-2.5 text-sm text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <CurrentStatusIcon
            className={cn("h-4 w-4", WATCH_STATUS_INDICATOR_TEXT[currentIndicator])}
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
                const indicator = WATCH_STATUS_INDICATOR[ws.value];
                const Icon = WATCH_STATUS_ICONS[ws.value];
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
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          WATCH_STATUS_INDICATOR_TEXT[indicator],
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
          <SeasonSelect
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSelect={(seasonNumber) => onSeasonChange?.(seasonNumber)}
          />
          <ProgressMetadata
            label="EPISODE"
            value={`${currentSeason?.episodesWatched ?? 0} of ${
              currentSeason?.episodeCount ?? episodeCount
            }`}
          />
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
