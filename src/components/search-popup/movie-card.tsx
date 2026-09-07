import { Languages, Plus, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MovieCardProps = {
  title: string;
  year?: string | number;
  rating?: string | number;
  genre?: string;
  originalLanguage?: string;
  synopsis?: string;
  poster?: string;
  posterAlt?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

function MovieCard({
  actionLabel = "Watchlist",
  className,
  genre,
  onAction,
  originalLanguage,
  poster,
  posterAlt,
  rating,
  synopsis,
  title,
  year,
}: MovieCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-40 w-full items-stretch gap-4 overflow-hidden rounded-xl border border-transparent bg-surface-container-high hover:bg-surface-container-low px-2 py-2 text-on-surface",
        className,
      )}
    >
      <div className="flex w-24 shrink-0 self-stretch items-center justify-center">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface-container-low shadow-md">
          {poster && (
            <Image
              alt={posterAlt ?? `${title} poster`}
              className="object-cover"
              fill
              src={poster}
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center py-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h3 className="truncate font-heading text-lg leading-7 font-semibold text-white">
            {title}
          </h3>
          {year ? (
            <span className="shrink-0 font-public-sans text-xs text-outline-muted">
              ({year})
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-2 font-public-sans text-xs">
          {rating !== undefined ? (
            <span className="flex items-center gap-1 font-semibold text-brand-tertiary-accent-alt">
              <Star className="size-3.5 fill-current" />
              {rating}
            </span>
          ) : null}
          {genre ? <span className="text-outline-muted">•</span> : null}
          {genre ? <span className="text-secondary">{genre}</span> : null}
          {originalLanguage ? (
            <span className="text-outline-muted">•</span>
          ) : null}
          {originalLanguage ? (
            <span className="flex items-center gap-1 text-secondary">
              <Languages className="size-3" />
              {originalLanguage}
            </span>
          ) : null}
        </div>

        {synopsis ? (
          <p className="mt-2 line-clamp-2 max-w-2xl font-public-sans text-xs leading-5 text-outline-muted">
            {synopsis}
          </p>
        ) : null}
      </div>

      <div className="hidden shrink-0 items-center pl-2 sm:flex">
        <Button
          className="gap-1.5 px-4 py-2 text-xs"
          onClick={onAction}
          type="button"
          variant="primaryFilled"
        >
          <Plus className="size-3.5" />
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}

export { MovieCard };
export type { MovieCardProps };
