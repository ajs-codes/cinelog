import type { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";

import { LIBRARY_PAGE_SIZE } from "@/lib/constants";
import { apiFetch } from "@/lib/http/client";
import type {
  LibraryMetadata,
  LibraryMovie,
  LibrarySeries,
} from "@/lib/types";
import {
  libraryFailed,
  libraryItemMutationFailed,
  libraryItemMutationRequested,
  libraryItemMutationSucceeded,
  libraryPageFailed,
  libraryPageRequested,
  libraryPageSucceeded,
  libraryRequested,
  librarySucceeded,
  type LibraryState,
  type SeriesProgressFields,
} from "./librarySlice";

type LibraryResponse = {
  error?: string;
  movies?: LibraryMovie[];
  series?: LibrarySeries[];
  metadata?: LibraryMetadata;
};

type SeriesPatchResponse = SeriesProgressFields & {
  error?: string;
};

type LibraryRoot = { library: LibraryState };

const emptyMetadata = (offset: number): LibraryMetadata => ({
  count: { movies: 0, series: 0 },
  offset,
  limit: LIBRARY_PAGE_SIZE,
  hasMore: false,
});

const activePageFetches = new Set<string>();
const activeLibraryMutations = new Set<string>();
const activeTypeFetches = new Set<string>();

function isLibraryFetchRoute() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/library");
}

function* fetchLibrary(
  action: ReturnType<typeof libraryRequested>,
): SagaIterator {
  if (!isLibraryFetchRoute()) return;

  const mediaType = action.payload.type;
  if (activeTypeFetches.has(mediaType)) return;

  const library: LibraryState = yield select(
    (state: LibraryRoot) => state.library,
  );
  const alreadyLoaded =
    mediaType === "movie" ? library.moviesLoaded : library.seriesLoaded;
  if (alreadyLoaded) return;

  activeTypeFetches.add(mediaType);

  const params = new URLSearchParams({
    type: mediaType,
    offset: "0",
    limit: String(LIBRARY_PAGE_SIZE),
  });

  try {
    const response: Response = yield call(
      fetch,
      `/api/library?${params.toString()}`,
      { cache: "no-store" },
    );
    const data: LibraryResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Library request failed");
    }

    yield put(
      librarySucceeded({
        type: mediaType,
        movies: data.movies ?? [],
        series: data.series ?? [],
        metadata: data.metadata ?? emptyMetadata(0),
      }),
    );
  } catch (error) {
    yield put(
      libraryFailed(
        error instanceof Error ? error.message : "Library request failed",
      ),
    );
  } finally {
    activeTypeFetches.delete(mediaType);
  }
}

function* fetchLibraryPage(
  action: ReturnType<typeof libraryPageRequested>,
): SagaIterator {
  const mediaType = action.payload.type;
  if (activePageFetches.has(mediaType)) return;
  activePageFetches.add(mediaType);

  const library: LibraryState = yield select(
    (state: LibraryRoot) => state.library,
  );
  const hasMore =
    mediaType === "movie" ? library.moviesHasMore : library.seriesHasMore;

  if (!hasMore || library.status !== "succeeded") {
    activePageFetches.delete(mediaType);
    return;
  }

  const offset =
    mediaType === "movie" ? library.movies.length : library.series.length;
  const params = new URLSearchParams({
    type: mediaType,
    offset: String(offset),
    limit: String(LIBRARY_PAGE_SIZE),
  });

  try {
    const response: Response = yield call(
      fetch,
      `/api/library?${params.toString()}`,
      { cache: "no-store" },
    );
    const data: LibraryResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Library request failed");
    }

    yield put(
      libraryPageSucceeded({
        type: mediaType,
        movies: data.movies ?? [],
        series: data.series ?? [],
        metadata: data.metadata ?? emptyMetadata(offset),
      }),
    );
  } catch (error) {
    yield put(
      libraryPageFailed({
        type: mediaType,
        error:
          error instanceof Error ? error.message : "Library request failed",
      }),
    );
  } finally {
    activePageFetches.delete(mediaType);
  }
}

function* mutateLibraryItem(
  action: ReturnType<typeof libraryItemMutationRequested>,
): SagaIterator {
  const { mediaType, tmdbId, watch_status, impression, progress } =
    action.payload;
  const mutationKey = `${mediaType}:${tmdbId}`;

  if (activeLibraryMutations.has(mutationKey)) return;
  activeLibraryMutations.add(mutationKey);

  const body = progress
    ? {
        mark_season_to_watched: progress.seasonNumber,
        mark_episode_to_watched: progress.episodeNumber,
      }
    : watch_status !== undefined
      ? { watch_status }
      : { impression };

  try {
    const response: Response = yield call(
      apiFetch,
      `/api/${mediaType}/${tmdbId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data: SeriesPatchResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Library update failed");
    }

    const seriesUpdate =
      mediaType === "series" && progress && data.seasons
        ? {
            watch_status: data.watch_status ?? null,
            impression: data.impression ?? null,
            total_number_of_episodes_watched:
              data.total_number_of_episodes_watched ?? 0,
            total_number_of_seasons_watched:
              data.total_number_of_seasons_watched ?? 0,
            seasons: data.seasons,
          }
        : undefined;

    yield put(
      libraryItemMutationSucceeded({ mediaType, tmdbId, seriesUpdate }),
    );
  } catch (error) {
    yield put(
      libraryItemMutationFailed({
        mediaType,
        tmdbId,
        error: error instanceof Error ? error.message : "Library update failed",
      }),
    );
  } finally {
    activeLibraryMutations.delete(mutationKey);
  }
}

export function* librarySaga(): SagaIterator {
  yield takeLatest(libraryRequested.type, fetchLibrary);
  yield takeEvery(libraryPageRequested.type, fetchLibraryPage);
  yield takeEvery(libraryItemMutationRequested.type, mutateLibraryItem);
}
