import { ActionBar } from "@/components/title-detail/hero-header/action_bar";
import { GenrePills } from "@/components/title-detail/hero-header/genre_pills";
import { MetaRow } from "@/components/title-detail/hero-header/meta_row";
import { PosterPanel } from "@/components/title-detail/hero-header/poster_panel";
import type { MovieDetails, SeriesDetails } from "@/lib/types";

type HeroHeaderProps = {
  movie?: MovieDetails | null;
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function HeroHeader({ movie, series, type }: HeroHeaderProps) {
  const title = movie?.title ?? series?.name ?? "N/A";
  const overview = movie?.overview ?? series?.overview ?? "N/A";
  const language =
    movie?.spoken_languages?.[0]?.name ?? series?.spoken_languages?.[0]?.name;
  const genres = movie?.genres ?? series?.genres;
  const mediaId = movie?.id ?? series?.id;
  const imdbId = movie?.imdb_id ?? series?.imdb_id;
  const posterPath = movie?.poster_path ?? series?.poster_path;
  const rating = movie?.vote_average ?? series?.vote_average;
  return (
    <section
      className="relative m-4 overflow-hidden rounded-[16px] border border-white/10 bg-linear-to-b from-surface-container-low via-surface-container to-surface p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] font-body"
      aria-label="Title header"
    >
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-tertiary/10 blur-[32px]" />
      <div className="absolute bottom-22 left-[26%] right-[42%] h-80 rounded-full bg-status-info/10 blur-[32px]" />

      <div className="relative grid grid-cols-12 gap-x-8 gap-y-8">
        <PosterPanel posterPath={posterPath} rating={rating} title={title} />

        <div className="col-span-9 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <MetaRow movie={movie} series={series} type={type} />

            <div className="space-y-2">
              <h1 className="font-heading text-[48px] leading-[0.96] tracking-[-1.2px] text-white">
                {title}
              </h1>
              <p className="max-w-230 text-[16px] font-medium text-outline-muted">
                {overview}
              </p>
            </div>

            <GenrePills genres={genres} type={series?.type ?? type} />
          </div>

          <ActionBar id={mediaId} imdbId={imdbId} language={language} />
        </div>
      </div>
    </section>
  );
}

export default HeroHeader;
