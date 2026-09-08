import { useGenrePills } from "@/hooks/title-details/use-genre-pills";

type GenrePillsProps = {
  genres?: Array<{ name?: string }>;
  type?: string;
};

export function GenrePills({ genres, type }: GenrePillsProps) {
  const genrePills = useGenrePills({ genres, type });

  return (
    <div className="mt-1 flex flex-wrap gap-2 pt-2">
      {genrePills.map(({ isType, label }) => (
        <span
          key={label}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
            isType
              ? "border border-brand-tertiary-accent bg-brand-tertiary-accent/10 text-brand-tertiary-accent-alt"
              : "border border-white/10 bg-surface-container/60 text-on-surface"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default GenrePills;
