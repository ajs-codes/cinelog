import { Clapperboard, TvMinimal } from "lucide-react";
import { Badge, type BadgeIndicator } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SearchMediaType = "movies" | "series";

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
    <div className="flex items-center justify-between gap-3 pt-1">
      <div className="flex items-center gap-1 rounded-xl border border-[#232527] bg-[#101112] p-1">
        <Button
          className="rounded-lg px-3.5 py-1.5"
          onClick={() => onMediaTypeChange("movies")}
          size="default"
          variant={mediaType === "movies" ? "primaryFilled" : "darkFilled"}
          type="button"
        >
          <Clapperboard className="size-3.5" />
          Movies
        </Button>
        <Button
          className="rounded-lg px-3.5 py-1.5 text-text-secondary no-underline"
          onClick={() => onMediaTypeChange("series")}
          size="default"
          variant={mediaType === "series" ? "primaryFilled" : "darkFilled"}
          type="button"
        >
          <TvMinimal className="size-3.5" />
          Series
        </Button>
      </div>

      <Badge
        className="border-[#262626] bg-[#161718] px-3.25 py-1.75 text-on-surface"
        indicator={resultIndicator}
        text={resultText}
      />
    </div>
  );
}
