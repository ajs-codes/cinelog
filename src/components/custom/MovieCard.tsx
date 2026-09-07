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

  return (
    <Card className="group/card w-full max-w-[240px] gap-0 overflow-hidden rounded-[8px] border-0 bg-surface-container-low p-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <CardContent className="p-0">
        <div className="relative h-[288px] overflow-hidden bg-surface-container-low">
          <img
            alt={`${title} poster`}
            className="absolute inset-0 h-full w-full object-cover"
            src={posterImage}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/20 to-transparent" />

          <div className="absolute left-[12px] top-[12px] flex h-[18px] items-center justify-center rounded-[2px] bg-surface-container-low/80 px-[8px] py-[2px] backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-[15px] text-brand-primary">
              {releaseYear}
            </span>
          </div>

          <div className="absolute right-[12px] top-[12px] flex h-[18px] items-center justify-center rounded-[2px] bg-surface-container px-[6px] py-[3px] backdrop-blur-[6px] max-h-[19px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] font-bold leading-[15px] text-brand-tertiary">
              ★ {rating.toFixed(1)}
            </span>
          </div>

          <div className="absolute inset-x-[12px] bottom-[12px] flex w-[calc(100%-24px)] flex-col items-start gap-[8.5px] pt-[6.5px]">
            <p className="w-full text-left font-public-sans text-[10px] font-semibold uppercase tracking-[0.5px] text-brand-primary">
              {episodeInfo}
            </p>

            <Progress
              value={completion}
              className="h-[6px] rounded-[12px] bg-surface-container-high"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-row items-center justify-between gap-[14px] rounded-none border-0 bg-surface-container-low px-[14px] py-[14px] text-on-surface">
        <div className="flex flex-col items-start justify-center">
          <h3 className="font-noto-sans text-[16px] font-semibold leading-[20px] text-on-surface">
            {title}
          </h3>
          <p className="font-public-sans text-[11px] leading-[16.5px] text-secondary">
            {completion}% completed
          </p>
        </div>

        <div className="flex h-[19px] items-center justify-center rounded-[4px] bg-surface-container-high px-[8px] py-[4px]">
          <span className="font-public-sans text-[9px] tracking-[0.5px] text-on-surface">
            {type}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
