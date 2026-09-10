import { Clapperboard, TvMinimal } from "lucide-react";
import { Badge, type BadgeIndicator } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SearchMediaType = "movie" | "series";

type SearchControlsProps = {
  mediaType: SearchMediaType;
  onMediaTypeChange: (mediaType: SearchMediaType) => void;
  resultIndicator?: BadgeIndicator;
  resultText: string;
};

export function SearchControls({
  mediaType,
  onMediaTypeChange,
  resultIndicator,
  resultText,
}: SearchControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 sm:gap-3 sm:pt-1">
      <div className="flex items-center gap-1 rounded-xl border border-[#232527] bg-[#101112] p-1 shrink-0">
        <Button
          className="rounded-lg px-2.5 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm"
          onClick={() => onMediaTypeChange("movie")}
          size="default"
          variant={mediaType === "movie" ? "primaryFilled" : "darkFilled"}
          type="button"
        >
          <Clapperboard className="size-3.5 shrink-0" />
          Movies
        </Button>
        <Button
          className="rounded-lg px-2.5 py-1 text-xs text-text-secondary no-underline sm:px-3.5 sm:py-1.5 sm:text-sm"
          onClick={() => onMediaTypeChange("series")}
          size="default"
          variant={mediaType === "series" ? "primaryFilled" : "darkFilled"}
          type="button"
        >
          <TvMinimal className="size-3.5 shrink-0" />
          Series
        </Button>
      </div>

      <Badge
        className="max-w-full truncate border-[#262626] bg-[#161718] px-2.5 py-1 text-xs text-on-surface sm:px-3.25 sm:py-1.75 shrink-0"
        indicator={resultIndicator}
        text={resultText}
      />
    </div>
  );
}
