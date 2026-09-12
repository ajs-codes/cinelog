import { useGenrePills } from "@/hooks/title-details/use-genre-pills";

type GenrePillsProps = {
  genres?: Array<{ name?: string }>;
  type?: string;
};

export function GenrePills({ genres, type }: GenrePillsProps) {
  const genrePills = useGenrePills({ genres, type });

  return (
    <div className="mt-1 flex flex-wrap gap-2 pt-2">
      {genrePills.map(({ isType, label }, index) => (
        <span
          key={`${isType ? "type" : "genre"}-${label}-${index}`}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
            isType
              ? "border border-outline-alt bg-surface-container-highest font-semibold text-brand-tertiary-accent-alt"
              : "border border-outline-alt bg-surface-container-high text-on-surface"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default GenrePills;
