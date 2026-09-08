type GenrePillsProps = {
  genres?: Array<{ name?: string }>;
  type?: string;
};

export function GenrePills({ genres: seriesGenres, type }: GenrePillsProps) {
  const genres = [
    type,
    ...(seriesGenres?.map((genre) => genre.name) ?? []),
  ].filter((genre): genre is string => Boolean(genre));

  return (
    <div className="mt-1 flex flex-wrap gap-2 pt-2">
      {genres.map((genre, index) => (
        <span
          key={genre}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
            index === 0
              ? "border border-brand-tertiary-accent bg-brand-tertiary-accent/10 text-brand-tertiary-accent-alt"
              : "border border-white/10 bg-surface-container/60 text-on-surface"
          }`}
        >
          {index === 0
            ? `${genre.charAt(0).toUpperCase()}${genre.slice(1)}`
            : genre}
        </span>
      ))}
    </div>
  );
}

export default GenrePills;
