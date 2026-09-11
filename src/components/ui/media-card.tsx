import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FALLBACK_POSTER, MEDIA_CARD_CLASS } from "@/lib/constants";
import { posterUrl } from "@/lib/media/display";
import { cn } from "@/lib/utils";

type MediaCardProps = {
  href: string;
  title: string;
  posterPath: string | null | undefined;
  year: string;
  rating: string;
  meta?: string;
  overlay?: ReactNode;
  actions: ReactNode;
  titleClassName?: string;
};

export function MediaCard({
  href,
  title,
  posterPath,
  year,
  rating,
  meta,
  overlay,
  actions,
  titleClassName,
}: MediaCardProps) {
  return (
    <Card className={MEDIA_CARD_CLASS}>
      <CardContent className="p-0">
        <Link
          aria-label={`View ${title} details`}
          className="relative block aspect-2/3 overflow-hidden bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary"
          href={href}
        >
          <Image
            alt={`${title} poster`}
            className="absolute inset-0 h-full w-full object-cover"
            fill
            loading="eager"
            sizes="(max-width: 640px) 50vw, (max-width: 1720px) 20vw, 240px"
            src={posterUrl(posterPath, FALLBACK_POSTER)}
          />
          <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-surface-container-low/20 to-transparent" />
          <div className="absolute top-3 left-3 flex h-4.5 items-center justify-center rounded-xs bg-surface-container-low/80 px-2 py-0.5 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] leading-3.75 font-bold text-brand-primary">
              {year}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex h-4.5 max-h-4.75 items-center justify-center rounded-xs bg-surface-container px-1.5 py-0.75 backdrop-blur-[6px]">
            <span className="flex items-center justify-center font-public-sans text-[10px] leading-3.75 font-bold text-brand-tertiary">
              ★ {rating}
            </span>
          </div>
          {overlay}
        </Link>
      </CardContent>
      <CardFooter className="h-[96.5px] min-w-0 flex-row items-end justify-between gap-2 rounded-none border-0 bg-surface-container-low px-2.5 py-3 text-on-surface sm:px-3.5">
        <Link
          className="flex min-w-0 flex-1 flex-col justify-end self-stretch rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          href={href}
          tabIndex={-1}
        >
          <h3
            className={cn(
              "line-clamp-2 font-noto-sans text-[16px] leading-5.5 font-semibold text-on-surface sm:text-[18px] sm:leading-6",
              titleClassName,
            )}
          >
            {title}
          </h3>
          {meta ? (
            <p className="mt-0.5 truncate font-public-sans text-[11px] leading-4 text-secondary">
              {meta}
            </p>
          ) : null}
        </Link>
        <div className="flex shrink-0 items-end gap-1 sm:gap-1.5">{actions}</div>
      </CardFooter>
    </Card>
  );
}
