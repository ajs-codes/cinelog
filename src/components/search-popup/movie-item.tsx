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
        "relative flex min-h-28 w-full items-stretch gap-2.5 overflow-hidden rounded-xl border border-transparent bg-surface-container-high p-2 text-on-surface hover:bg-surface sm:min-h-40 sm:gap-4",
        className,
      )}
    >
      {showWatchlistBadge ? (
        <Badge
          className="pointer-events-none absolute right-2 top-2 z-10 border-status-success/30 bg-status-success/10 px-2 py-0.5 text-[10px] text-status-success sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs"
          inlineStart={<Check className="size-3 sm:size-3.5" />}
          text="In Watchlist"
        />
      ) : null}
      {state === "loading" ? (
        <div className="flex w-full animate-pulse items-center gap-2.5 px-1 py-1 sm:gap-4 sm:px-2 sm:py-3">
          <div className="h-28 w-20 shrink-0 rounded-lg bg-surface-container-low sm:h-36 sm:w-24" />
          <div className="flex flex-1 flex-col gap-2 sm:gap-3">
            <div className="h-4 w-2/3 rounded bg-surface-container-low sm:h-5" />
            <div className="h-2.5 w-1/3 rounded bg-surface-container-low sm:h-3" />
            <div className="h-2.5 w-full rounded bg-surface-container-low sm:h-3" />
            <div className="h-2.5 w-4/5 rounded bg-surface-container-low sm:h-3" />
          </div>
        </div>
      ) : state === "failed" ? (
        <div className="flex min-h-28 w-full items-center justify-center px-4 py-6 text-center sm:min-h-36 sm:py-8">
          <h3 className="font-heading text-base font-semibold text-white sm:text-lg">
            {title ?? "No results found"}
          </h3>
        </div>
      ) : (
        <>
          <Link
            href={id !== undefined ? `/${mediaType}/${id}` : "#"}
            className="flex min-w-0 flex-1 items-stretch gap-2.5 sm:gap-4"
            onClick={onItemClick}
          >
            <div className="flex w-20 shrink-0 self-stretch items-center justify-center sm:w-24">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface-container-low shadow-md">
                {poster && (
                  <Image
                    alt={posterAlt ?? `${title ?? "Movie"} poster`}
                    className="object-cover"
                    fill
                    src={poster}
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col justify-start py-1 sm:py-3",
                showWatchlistBadge && "pr-24 sm:pr-32",
              )}
            >
              <div className="flex min-w-0 items-baseline gap-1.5 sm:gap-2">
                <h3 className="truncate font-heading text-base font-semibold leading-6 text-white sm:text-lg sm:leading-7">
                  {title ?? "Untitled"}
                </h3>
                {year ? (
                  <span className="shrink-0 font-public-sans text-[11px] text-outline-muted sm:text-xs">
                    ({year})
                  </span>
                ) : null}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-public-sans text-[11px] sm:gap-2 sm:text-xs">
                {rating !== undefined ? (
                  <span className="flex items-center gap-1 font-semibold text-brand-tertiary-accent-alt">
                    <Star className="size-3 fill-current sm:size-3.5" />
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
                    <Languages className="size-2.5 sm:size-3" />
                    {formatLanguage(originalLanguage)}
                  </span>
                ) : null}
              </div>

              {synopsis ? (
                <p className="mt-1 line-clamp-2 max-w-2xl font-public-sans text-[11px] leading-4 text-outline-muted sm:mt-2 sm:text-xs sm:leading-5">
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
