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
    <div className="relative col-span-1 aspect-2/3 w-full max-w-48 sm:max-w-56 md:max-w-60 justify-self-center overflow-hidden rounded-xl bg-surface-container-high md:col-span-3 md:justify-self-start">
      {posterPath ? (
        <Image
          alt={`${title} poster`}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 240px"
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        />
      ) : null}

      <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-highest px-2.5 py-1 text-xs font-bold tracking-wider text-on-surface shadow-md">
        <Star className="size-3.5 fill-brand-tertiary-accent text-brand-tertiary-accent" />
        <span>{formattedRating}</span>
      </div>
    </div>
  );
}

export default PosterPanel;
