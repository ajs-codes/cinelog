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
  original_language?: string | null;
  status?: string;
  tagline?: string | null;
  type?: string;
  vote_average?: number;
  is_present_in_watchlist?: boolean;
  impression?: number | null;
  watch_status?: number | null;
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
  release_date?: string | null;
  certification?: {
    certification?: string | null;
    descriptors?: string[];
    iso_639_1?: string | null;
    note?: string | null;
    release_date?: string;
    type?: number;
  } | null;
  runtime?: number | null;
  original_language?: string | null;
  status?: string;
  tagline?: string | null;
  title?: string | null;
  vote_average?: number;
  is_present_in_watchlist?: boolean;
  impression?: number | null;
  watch_status?: number | null;
};

type BadgeIndicator = "success" | "info" | "error" | "accentAlt";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TmdbCastMember = {
  id?: number;
  name?: string;
  order?: number;
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbCrewMember = {
  id?: number;
  name?: string;
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbReleaseDate = {
  certification?: string | null;
  descriptors?: string[];
  iso_639_1?: string | null;
  note?: string | null;
  release_date?: string;
  type?: number;
};

type TmdbMovie = {
  backdrop_path?: string | null;
  belongs_to_collection?: unknown;
  genres?: Array<{ id?: number; name?: string }> | null;
  id?: number;
  imdb_id?: string | null;
  overview?: string;
  poster_path?: string | null;
  production_companies?: Array<{
    id?: number;
    name?: string;
    origin_country?: string;
  }> | null;
  release_date?: string;
  runtime?: number | null;
  status?: string;
  tagline?: string | null;
  title?: string;
  vote_average?: number;
  original_language?: string | null;
  origin_country?: string[] | null;
  release_dates?: {
    results?: Array<{
      iso_3166_1?: string;
      release_dates?: TmdbReleaseDate[];
      [key: string]: unknown;
    }>;
  };
  credits?:
    | {
        cast?: TmdbCastMember[];
        crew?: TmdbCrewMember[];
      }
    | Array<{ id?: number; name?: string; known_for_department?: string }>;
};

type MoviePayload = Omit<TmdbMovie, "release_dates"> & {
  certification?: TmdbReleaseDate | null;
};

type TmdbContentRating = {
  iso_3166_1?: string;
  rating?: string;
  [key: string]: unknown;
};

type TmdbSeries = {
  backdrop_path?: string | null;
  created_by?: Array<{ id?: number; name?: string }> | null;
  first_air_date?: string;
  genres?: Array<{ id?: number; name?: string }> | null;
  id?: number;
  last_air_date?: string;
  name?: string;
  networks?: unknown[] | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  overview?: string;
  poster_path?: string | null;
  production_companies?: Array<{
    id?: number;
    name?: string;
    origin_country?: string;
  }> | null;
  seasons?: Array<{
    id?: number;
    name?: string;
    season_number?: number;
    episode_count?: number;
    air_date?: string;
  }> | null;
  status?: string;
  tagline?: string | null;
  type?: string;
  vote_average?: number;
  original_language?: string | null;
  origin_country?: string[] | null;
  content_ratings?: {
    results?: TmdbContentRating[];
  };
  imdb_id?: string | null;
  external_ids?: {
    imdb_id?: string | null;
  };
  credits?:
    | {
        cast?: TmdbCastMember[];
        crew?: TmdbCrewMember[];
      }
    | Array<{ id?: number; name?: string; known_for_department?: string }>;
};

type SearchType = "movie" | "tv";

type TmdbResult = {
  genre_ids?: number[];
  id?: number;
  original_language?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  vote_average?: number;
};

type TmdbSearchResponse = {
  results?: TmdbResult[];
};

export type {
  BadgeIndicator,
  MovieDetails,
  MoviePayload,
  RouteContext,
  SearchType,
  SeriesDetails,
  SeriesSeason,
  TmdbContentRating,
  TmdbCrewMember,
  TmdbMovie,
  TmdbReleaseDate,
  TmdbResult,
  TmdbSearchResponse,
  TmdbSeries,
};
