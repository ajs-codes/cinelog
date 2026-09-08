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
      {genres.map((genre) => (
        <span
          key={genre}
          className="rounded-full border border-white/10 bg-surface-container/60 px-3.5 py-1.5 text-[12px] font-medium text-on-surface transition"
        >
          {genre}
        </span>
      ))}
    </div>
  );
}

export default GenrePills;
