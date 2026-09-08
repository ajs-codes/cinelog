type GenrePill = {
  isType: boolean;
  label: string;
};

type GenrePillsInput = {
  genres?: Array<{ name?: string }>;
  type?: string;
};

export function useGenrePills({ genres, type }: GenrePillsInput): GenrePill[] {
  const typePill = type
    ? [
        {
          isType: true,
          label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
        },
      ]
    : [];
  const genrePills = (genres ?? [])
    .map((genre) => genre.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => ({ isType: false, label: name }));

  return [...typePill, ...genrePills];
}
