import { SegmentedControl } from "@/components/ui/segmented-control";
import { MEDIA_TYPES } from "@/lib/constants";
import type { LibraryMediaType } from "@/lib/types";

export type { LibraryMediaType };

type LibraryFilterControlsProps = {
  movieCount: number;
  seriesCount: number;
  mediaType: LibraryMediaType;
  onMediaTypeChange?: (mediaType: LibraryMediaType) => void;
};

export function LibraryFilterControls({
  movieCount,
  seriesCount,
  mediaType,
  onMediaTypeChange,
}: LibraryFilterControlsProps) {
  const counts: Record<LibraryMediaType, number> = {
    movie: movieCount,
    series: seriesCount,
  };

  return (
    <SegmentedControl
      aria-label="Filter library by media type"
      onChange={onMediaTypeChange}
      options={MEDIA_TYPES.map(({ icon: Icon, label, value, href }) => ({
        value,
        label,
        href,
        icon: <Icon className="size-3.5 shrink-0" />,
        badge: (
          <span
            aria-label={`${counts[value]} ${value === "movie" ? "movies" : "series"}`}
            className={`inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-md px-1.5 font-public-sans text-[10px] leading-none font-medium ${
              mediaType === value
                ? "bg-white/15 text-white"
                : "bg-surface-container-high text-secondary"
            }`}
          >
            {counts[value]}
          </span>
        ),
      }))}
      value={mediaType}
    />
  );
}
