"use client";

import { useMemo } from "react";
import { Clapperboard, TvMinimal } from "lucide-react";
import { SearchFilterSelect } from "@/components/search-popup/search-filter-select";
import { Badge, type BadgeIndicator } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSearchYears, TMDB_REGIONS } from "@/lib/search/filters";

export type SearchMediaType = "movie" | "series";

type SearchControlsProps = {
  mediaType: SearchMediaType;
  onMediaTypeChange: (mediaType: SearchMediaType) => void;
  onRegionChange: (region?: string) => void;
  onYearChange: (year?: number) => void;
  region?: string;
  resultIndicator?: BadgeIndicator;
  resultText: string;
  year?: number;
};

export function SearchControls({
  mediaType,
  onMediaTypeChange,
  onRegionChange,
  onYearChange,
  region,
  resultIndicator,
  resultText,
  year,
}: SearchControlsProps) {
  const yearOptions = useMemo(
    () => [
      { value: "", label: "Any year" },
      ...getSearchYears().map((searchYear) => ({
        value: String(searchYear),
        label: String(searchYear),
      })),
    ],
    [],
  );
  const regionOptions = useMemo(
    () => [
      { value: "", label: "Any region" },
      ...TMDB_REGIONS.map((tmdbRegion) => ({
        value: tmdbRegion.iso_3166_1,
        label: tmdbRegion.english_name,
      })),
    ],
    [],
  );

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 pt-0.5 sm:gap-3 sm:pt-1">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#232527] bg-[#101112] p-1">
          <Button
            className="rounded-lg px-2.5 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm"
            onClick={() => onMediaTypeChange("movie")}
            size="default"
            type="button"
            variant={mediaType === "movie" ? "primaryFilled" : "darkFilled"}
          >
            <Clapperboard className="size-3.5 shrink-0" />
            Movies
          </Button>
          <Button
            className="rounded-lg px-2.5 py-1 text-xs text-text-secondary no-underline sm:px-3.5 sm:py-1.5 sm:text-sm"
            onClick={() => onMediaTypeChange("series")}
            size="default"
            type="button"
            variant={mediaType === "series" ? "primaryFilled" : "darkFilled"}
          >
            <TvMinimal className="size-3.5 shrink-0" />
            Series
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#232527] bg-[#101112] p-1">
          <SearchFilterSelect
            aria-label="Filter by year"
            heading="Year"
            onChange={(nextYear) =>
              onYearChange(nextYear ? Number(nextYear) : undefined)
            }
            options={yearOptions}
            placeholder="Any year"
            value={year ? String(year) : ""}
          />
          {mediaType === "movie" ? (
            <SearchFilterSelect
              aria-label="Filter by region"
              heading="Region"
              onChange={(nextRegion) =>
                onRegionChange(nextRegion || undefined)
              }
              options={regionOptions}
              placeholder="Any region"
              searchPlaceholder="Search regions"
              searchable
              value={region ?? ""}
            />
          ) : null}
        </div>
      </div>

      <Badge
        className="max-w-full truncate border-[#262626] bg-[#161718] px-2.5 py-1 text-xs text-on-surface sm:px-3.25 sm:py-1.75 shrink-0"
        indicator={resultIndicator}
        text={resultText}
      />
    </div>
  );
}
