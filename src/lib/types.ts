type SeriesDetails = {
  backdrop_path?: string | null;
  content_ratings?: {
    iso_3166_1?: string;
    rating?: string;
  };
  created_by?: Array<{ id?: number; name?: string }>;
  first_air_date?: string;
  genres?: Array<{ id?: number; name?: string }>;
  id?: number;
  imdb_id?: string | null;
  last_air_date?: string;
  name?: string | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  overview?: string | null;
  poster_path?: string | null;
  seasons?: SeriesSeason[];
  spoken_languages?: Array<{ name?: string; english_name?: string }>;
  status?: string;
  tagline?: string | null;
  type?: string;
  vote_average?: number;
};

type SeriesSeason = {
  air_date?: string | null;
  episode_count?: number;
  id?: number;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  season_number?: number;
  vote_average?: number;
};

type MovieDetails = {
  genres?: Array<{ id?: number; name?: string }>;
  id?: number;
  imdb_id?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  release_date?: string;
  runtime?: number | null;
  spoken_languages?: Array<{ name?: string; english_name?: string }>;
  status?: string;
  tagline?: string | null;
  title?: string | null;
  vote_average?: number;
};

export type { MovieDetails, SeriesDetails };
