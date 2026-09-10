import { Clapperboard, TvMinimal, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type LibraryMediaType = "movie" | "series";

const MEDIA_TYPES: {
  icon: LucideIcon;
  label: string;
  value: LibraryMediaType;
}[] = [
  { icon: Clapperboard, label: "Movies", value: "movie" },
  { icon: TvMinimal, label: "Series", value: "series" },
];

type LibraryFilterControlsProps = {
  countText: string;
  mediaType: LibraryMediaType;
  onMediaTypeChange: (mediaType: LibraryMediaType) => void;
};

export function LibraryFilterControls({
  countText,
  mediaType,
  onMediaTypeChange,
}: LibraryFilterControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        aria-label="Filter library by media type"
        className="flex items-center gap-1 rounded-xl border border-outline-alt bg-surface-container-low p-1"
        role="group"
      >
        {MEDIA_TYPES.map(({ icon: Icon, label, value }) => (
          <Button
            aria-pressed={mediaType === value}
            className="rounded-lg px-2.5 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm"
            key={value}
            onClick={() => onMediaTypeChange(value)}
            type="button"
            variant={mediaType === value ? "primaryFilled" : "darkFilled"}
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
          </Button>
        ))}
      </div>

      <Badge className="text-on-surface shrink-0" text={countText} />
    </div>
  );
}
