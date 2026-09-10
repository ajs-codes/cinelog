import type { SagaIterator } from "redux-saga";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

import type { LibraryMovie, LibrarySeries } from "@/lib/types";
import {
  libraryFailed,
  libraryItemMutationFailed,
  libraryItemMutationRequested,
  libraryItemMutationSucceeded,
  libraryRequested,
  librarySucceeded,
} from "./librarySlice";

type LibraryResponse = {
  error?: string;
  movies?: LibraryMovie[];
  series?: LibrarySeries[];
};

const LIBRARY_FETCH_ROUTES = new Set(["/", "/library"]);

let isFetchingLibrary = false;

function isLibraryFetchRoute() {
  if (typeof window === "undefined") return false;
  return LIBRARY_FETCH_ROUTES.has(window.location.pathname);
}

function* fetchLibrary(): SagaIterator {
  if (!isLibraryFetchRoute() || isFetchingLibrary) return;
  isFetchingLibrary = true;

  try {
    const response: Response = yield call(fetch, "/api/library", {
      cache: "no-store",
    });
    const data: LibraryResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Library request failed");
    }

    yield put(
      librarySucceeded({
        movies: data.movies ?? [],
        series: data.series ?? [],
      }),
    );
  } catch (error) {
    yield put(
      libraryFailed(
        error instanceof Error ? error.message : "Library request failed",
      ),
    );
  } finally {
    isFetchingLibrary = false;
  }
}

const activeLibraryMutations = new Set<string>();

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
      fetch,
      `/api/${mediaType}/${tmdbId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data: { error?: string } = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Library update failed");
    }

    yield put(libraryItemMutationSucceeded({ mediaType, tmdbId }));
    if (progress) {
      yield put(libraryRequested());
    }
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
  yield takeEvery(libraryItemMutationRequested.type, mutateLibraryItem);
}
