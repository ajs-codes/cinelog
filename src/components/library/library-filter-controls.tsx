import Link from "next/link";
import { Clapperboard, TvMinimal, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export type LibraryMediaType = "movie" | "series";

const MEDIA_TYPES: {
  icon: LucideIcon;
  label: string;
  value: LibraryMediaType;
  href: string;
}[] = [
  {
    icon: Clapperboard,
    label: "Movies",
    value: "movie",
    href: "/library/movies",
  },
  {
    icon: TvMinimal,
    label: "Series",
    value: "series",
    href: "/library/series",
  },
];

type LibraryFilterControlsProps = {
  movieCount: number;
  seriesCount: number;
  mediaType: LibraryMediaType;
  onMediaTypeChange?: (mediaType: LibraryMediaType) => void;
};

export function LibraryFilterControls({
  movieCount,
  seriesCount,
  mediaType,
  onMediaTypeChange,
}: LibraryFilterControlsProps) {
  const counts: Record<LibraryMediaType, number> = {
    movie: movieCount,
    series: seriesCount,
  };

  return (
    <div
      aria-label="Filter library by media type"
      className="flex w-fit items-center gap-1 rounded-xl border border-outline-alt bg-surface-container-low p-1"
      role="group"
    >
      {MEDIA_TYPES.map(({ icon: Icon, label, value, href }) => {
        const count = counts[value];
        const isActive = mediaType === value;

        return (
          <Link
            aria-pressed={isActive}
            aria-current={isActive ? "page" : undefined}
            className={buttonVariants({
              variant: isActive ? "primaryFilled" : "darkFilled",
              className:
                "rounded-lg px-2.5 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm",
            })}
            href={href}
            key={value}
            onClick={() => onMediaTypeChange?.(value)}
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
            <span
              aria-label={`${count} ${value === "movie" ? "movies" : "series"}`}
              className={`inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-md px-1.5 font-public-sans text-[10px] font-medium leading-none ${
                isActive
                  ? "bg-white/15 text-white"
                  : "bg-surface-container-high text-secondary"
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
