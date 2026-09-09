"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import type { SeasonOption } from "@/hooks/title-details/use-progress-seasons";
import { cn } from "@/lib/utils";

type SeasonSelectProps = {
  disabled?: boolean;
  onSelect: (seasonNumber: number) => void;
  seasons: SeasonOption[];
  selectedSeason?: number;
};

export function SeasonSelect({
  disabled = false,
  onSelect,
  seasons,
  selectedSeason,
}: SeasonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDisabled = disabled || seasons.length === 0;

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

  const current = seasons.find(
    (season) => season.seasonNumber === selectedSeason,
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-high/70 px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-secondary uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high transition-colors disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="text-outline-muted">SEASON</span>
        <span className="text-on-surface tracking-normal">
          {current?.seasonNumber ?? "—"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-outline-muted transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 max-h-72 w-full overflow-hidden rounded-xl border border-outline-alt bg-surface-container shadow-[0_8px_24px_rgb(0_0_0/25%)] z-50">
          <div className="movie-lists-scrollbar flex max-h-72 flex-col overflow-y-auto py-1.5">
            {seasons.map((season) => {
              const isSelected = season.seasonNumber === selectedSeason;
              return (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (!isSelected) {
                      onSelect(season.seasonNumber);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-1.5 px-2.5 py-2 text-left text-on-surface hover:bg-surface-container-high transition-colors",
                    isSelected && "bg-surface-container-high",
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate">
                      {season.label}
                    </span>
                    <span className="text-[11px] text-outline-muted truncate">
                      {season.episodeCount} Episodes
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeasonSelect;
