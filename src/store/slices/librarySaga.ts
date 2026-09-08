import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import type { MovieCardData } from "@/components/custom/movie-card";
import {
  libraryFailed,
  libraryRequested,
  librarySucceeded,
} from "./librarySlice";

type LibraryResponse = {
  error?: string;
  movies?: MovieCardData[];
  series?: MovieCardData[];
};

function* fetchLibrary(): SagaIterator {
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
  }
}

export function* librarySaga(): SagaIterator {
  yield takeLatest(libraryRequested.type, fetchLibrary);
}
