import { Clapperboard, TvMinimal, type LucideIcon } from "lucide-react";

import type { LibraryMediaType } from "@/lib/types/library";

export const MEDIA_TYPES: {
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

export const COLLECTION_MEDIA_TYPE: Record<LibraryMediaType, number> = {
  movie: 0,
  series: 1,
};
