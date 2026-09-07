import Image from "next/image";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type MovieCardData = {
  releaseYear: number;
  posterImage: string;
  rating: number;
  episodeInfo: string;
  title: string;
  completion: number;
  type: "Movie" | "Series";
};

export function MovieCard({ movie }: { movie: MovieCardData }) {
  const {
    releaseYear,
    posterImage,
    rating,
    episodeInfo,
    title,
    completion,
    type,
  } = movie;
  const isLongTitle = title.length > 18;

  return (
    <Card className="group/card h-[352.5px] w-60 min-w-60 gap-0 overflow-hidden rounded-[8px] border-0 bg-surface-container-low p-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <CardContent className="p-0">
        <div
          className={`relative overflow-hidden bg-surface-container-low ${
            isLongTitle ? "h-68" : "h-72"
          }`}
        >
          <Image
            alt={`${title} poster`}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            loading="eager"
            src={posterImage}
            sizes="(max-width: 240px) 100vw, 240px"
          />

          <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-surface-container-low/20 to-transparent" />

          <div className="absolute left-3 top-3 flex h-4.5 items-center justify-center rounded-xs bg-surface-container-low/80 px-2 py-0.5 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-3.75 text-brand-primary">
              {releaseYear}
            </span>
          </div>

          <div className="absolute right-3 top-3 flex h-4.5 items-center justify-center rounded-xs bg-surface-container px-1.5 py-0.75 backdrop-blur-[6px] max-h-4.75">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-3.75 text-brand-tertiary">
              ★ {rating.toFixed(1)}
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex w-[calc(100%-24px)] flex-col items-start gap-[8.5px] pt-[6.5px]">
            <p className="w-full text-left font-public-sans text-[10px] font-semibold uppercase tracking-[0.5px] text-brand-primary">
              {episodeInfo}
            </p>

            <Progress
              value={completion}
              className="h-1.5 rounded-[12px] bg-surface-container-high"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={`flex-row items-start justify-between gap-3.5 rounded-none border-0 bg-surface-container-low px-3.5 py-3.5 text-on-surface ${
          isLongTitle ? "h-[80.5px]" : "h-[64.5px]"
        }`}
      >
        <div className="min-w-0 flex-1">
          <h3
            className={`line-clamp-2 font-noto-sans font-semibold text-on-surface ${
              isLongTitle ? "text-[14px] leading-4.5" : "text-[16px] leading-5"
            }`}
          >
            {title}
          </h3>
          <p className="font-public-sans text-[11px] leading-[16.5px] text-secondary">
            {completion}% completed
          </p>
        </div>

        <div className="flex h-4.75 items-center justify-center rounded-lg bg-surface-container-high px-2 py-1">
          <span className="font-public-sans text-[9px] tracking-[0.5px] text-on-surface">
            {type}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
