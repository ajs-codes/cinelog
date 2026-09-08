import { Star } from "lucide-react";
import Image from "next/image";

type PosterPanelProps = {
  posterPath?: string | null;
  rating?: number | null;
  title: string;
};

export function PosterPanel({ posterPath, rating, title }: PosterPanelProps) {
  const formattedRating =
    typeof rating === "number" && Number.isFinite(rating)
      ? rating.toFixed(1)
      : "N/A";

  return (
    <div className="relative col-span-3 aspect-2/3 max-w-60 justify-self-start overflow-hidden rounded-xl bg-surface-container-high">
      {posterPath ? (
        <Image
          alt={`${title} poster`}
          className="object-cover"
          fill
          priority
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        />
      ) : null}

      <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-brand-tertiary-accent/30 bg-black/80 px-2.5 py-1.5 text-xs font-bold tracking-wider text-white backdrop-blur-[6px]">
        <Star className="size-3 fill-brand-tertiary-accent text-brand-tertiary-accent" />
        <span>{formattedRating}</span>
      </div>
    </div>
  );
}

export default PosterPanel;
