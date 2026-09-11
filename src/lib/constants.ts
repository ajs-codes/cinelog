import { AlertCircle, Check, Info } from "lucide-react";

export const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w200";

export const VARIANT_CONFIG = {
  success: {
    icon: Check,
    iconBg: "bg-status-success/15 text-status-success",
    border: "border-status-success/35",
  },
  info: {
    icon: Info,
    iconBg: "bg-status-info/15 text-status-info",
    border: "border-status-info/35",
  },
  error: {
    icon: AlertCircle,
    iconBg: "bg-status-error/15 text-status-error",
    border: "border-status-error/35",
  },
} as const;

export const CUSTOM_COLLECTIONS = {
  media_type: {
    0: { value: "movie", display_value: "Movie" },
    1: { value: "series", display_value: "Series" },
  },
  group_by: {
    0: { value: "watch_status", display_value: "Watch Status" },
    1: { value: "year", display_value: "Year" },
    2: { value: "status", display_value: "Status" },
  },
  operator: {
    0: { value: "eq", display_value: "Equals" },
    1: { value: "neq", display_value: "Not Equals" },
    2: { value: "gt", display_value: "Greater Than" },
    3: { value: "lt", display_value: "Less Than" },
    4: { value: "in", display_value: "In" },
    5: { value: "contains", display_value: "Contains" },
  },
  direction: {
    0: { value: "asc", display_value: "Ascending" },
    1: { value: "desc", display_value: "Descending" },
  },
  filter_field: {
    watch_status: { value: "watch_status", display_value: "Watch Status" },
    impression: { value: "impression", display_value: "User Impression" },
    vote_average: { value: "vote_average", display_value: "TMDB Rating" },
    release_year: { value: "release_year", display_value: "Release Year" },
    status: { value: "status", display_value: "Status" },
    genre: { value: "genre", display_value: "Genre" },
    original_language: {
      value: "original_language",
      display_value: "Original Language",
    },
    origin_country: {
      value: "origin_country",
      display_value: "Origin Country",
    },
  },
  sort_field: {
    created_at: { value: "created_at", display_value: "Date Added" },
    release_date: { value: "release_date", display_value: "Release Date" },
    title: { value: "title", display_value: "Title (A-Z)" },
    vote_average: { value: "vote_average", display_value: "TMDB Rating" },
    last_watched_at: {
      value: "last_watched_at",
      display_value: "Last Watched",
    },
    completed_at: { value: "completed_at", display_value: "Completed Date" },
  },
} as const;

export const LIBRARY_PAGE_SIZE = 20;
export const LIBRARY_PAGE_SIZE_MAX = 50;

export const SEARCH_YEAR_MIN = 1900;
export const SEARCH_PAGE_MAX = 500;

export const WATCH_STATUS = {
  0: { value: 0, display_value: "Plan to Watch" },
  1: { value: 1, display_value: "Watching" },
  2: { value: 2, display_value: "Completed" },
  3: { value: 3, display_value: "Dropped" },
} as const;

export const IMPRESSION = {
  0: { value: 0, display_value: "Dislike" },
  1: { value: 1, display_value: "Like" },
  2: { value: 2, display_value: "Love" },
} as const;

export const MOVIE_STATUS = {
  rumored: { value: "rumored", display_value: "Rumored" },
  planned: { value: "planned", display_value: "Planned" },
  in_production: { value: "in_production", display_value: "In Production" },
  post_production: {
    value: "post_production",
    display_value: "Post Production",
  },
  released: { value: "released", display_value: "Released" },
  canceled: { value: "canceled", display_value: "Canceled" },
} as const;

export const SERIES_STATUS = {
  returning_series: {
    value: "returning_series",
    display_value: "Returning Series",
  },
  planned: { value: "planned", display_value: "Planned" },
  in_production: { value: "in_production", display_value: "In Production" },
  ended: { value: "ended", display_value: "Ended" },
  canceled: { value: "canceled", display_value: "Canceled" },
  pilot: { value: "pilot", display_value: "Pilot" },
} as const;
