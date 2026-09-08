import { Check, Languages, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, formatLanguage, formatRating } from "@/lib/utils";

type MovieItemProps = {
  id?: number;
  title?: string;
  year?: string | number;
  rating?: string | number;
  genre?: string;
  isPresentInWatchlist?: boolean;
  mediaType?: "movie" | "series";
  originalLanguage?: string;
  synopsis?: string;
  poster?: string;
  posterAlt?: string;
  actionLabel?: string;
  onItemClick?: () => void;
  className?: string;
  state?: "default" | "loading" | "failed";
};

function MovieItem({
  className,
  genre,
  id,
  isPresentInWatchlist = false,
  mediaType,
  onItemClick,
  originalLanguage,
  poster,
  posterAlt,
  rating,
  synopsis,
  title,
  year,
  state = "default",
}: MovieItemProps) {
  const showWatchlistBadge = state === "default" && isPresentInWatchlist;

  return (
    <article
      className={cn(
        "relative flex min-h-40 w-full items-stretch gap-2 overflow-hidden rounded-xl border border-transparent bg-surface-container-high px-2 py-2 text-on-surface hover:bg-surface sm:gap-4",
        className,
      )}
    >
      {showWatchlistBadge ? (
        <Badge
          className="pointer-events-none absolute right-3 top-3 z-10 border-status-success/30 bg-status-success/10 text-status-success"
          inlineStart={<Check />}
          text="In Watchlist"
        />
      ) : null}
      {state === "loading" ? (
        <div className="flex w-full animate-pulse items-center gap-4 px-2 py-3">
          <div className="h-36 w-24 shrink-0 rounded-lg bg-surface-container-low" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-5 w-2/3 rounded bg-surface-container-low" />
            <div className="h-3 w-1/3 rounded bg-surface-container-low" />
            <div className="h-3 w-full rounded bg-surface-container-low" />
            <div className="h-3 w-4/5 rounded bg-surface-container-low" />
          </div>
        </div>
      ) : state === "failed" ? (
        <div className="flex min-h-36 w-full items-center justify-center px-4 py-8 text-center">
          <h3 className="font-heading text-lg font-semibold text-white">
            {title ?? "No results found"}
          </h3>
        </div>
      ) : (
        <>
          <Link
            href={id !== undefined ? `/${mediaType}/${id}` : "#"}
            className="flex min-w-0 flex-1 items-stretch gap-2 sm:gap-4"
            onClick={onItemClick}
          >
            <div className="flex w-24 shrink-0 self-stretch items-center justify-center">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface-container-low shadow-md">
                {poster && (
                  <Image
                    alt={posterAlt ?? `${title ?? "Movie"} poster`}
                    className="object-cover"
                    fill
                    src={poster}
                    sizes="96px"
                  />
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col justify-start py-3",
                showWatchlistBadge && "pr-32",
              )}
            >
              <div className="flex min-w-0 items-baseline gap-2">
                <h3 className="truncate font-heading text-lg leading-7 font-semibold text-white">
                  {title ?? "Untitled"}
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
                    {formatRating(rating)}
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
                    {formatLanguage(originalLanguage)}
                  </span>
                ) : null}
              </div>

              {synopsis ? (
                <p className="mt-2 line-clamp-2 max-w-2xl font-public-sans text-xs leading-5 text-outline-muted">
                  {synopsis}
                </p>
              ) : null}
            </div>
          </Link>
        </>
      )}
    </article>
  );
}

export { MovieItem };
export type { MovieItemProps };
