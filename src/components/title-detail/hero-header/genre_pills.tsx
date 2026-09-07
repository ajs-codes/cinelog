const genres = ["Action", "Sci-Fi", "Cyberpunk", "Animation", "Dystopian"];
// TODO: Make this dynamic based on the title's genres

export function GenrePills() {
  return (
    <div className="mt-1 flex flex-wrap gap-2 pt-2">
      {genres.map((genre) => (
        <span
          key={genre}
          className="rounded-full border border-white/10 bg-surface-container/60 px-3.5 py-1.5 text-[12px] font-medium text-on-surface transition hover:bg-surface-container-high"
        >
          {genre}
        </span>
      ))}
    </div>
  );
}

export default GenrePills;
