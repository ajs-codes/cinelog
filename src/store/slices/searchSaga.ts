import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  searchFailed,
  searchRequested,
  searchSucceeded,
  type SearchMediaType,
  type SearchResult,
} from "./searchSlice";

type SearchResponse = {
  error?: string;
  results?: SearchResult[];
};

function* fetchSearchResults(
  action: ReturnType<typeof searchRequested>,
): SagaIterator {
  const { mediaType, query } = action.payload;
  const endpoint = mediaType === "movies" ? "movie" : "series";

  try {
    const response: Response = yield call(
      fetch,
      `/api/search/${endpoint}?query=${encodeURIComponent(query)}`,
    );
    const data: SearchResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Search request failed");
    }

    yield put(
      searchSucceeded({
        mediaType,
        query,
        results: data.results ?? [],
      }),
    );
  } catch (error) {
    yield put(
      searchFailed({
        error: error instanceof Error ? error.message : "Search request failed",
        mediaType,
        query,
      }),
    );
  }
}

export function* searchSaga(): SagaIterator {
  yield takeLatest(searchRequested.type, fetchSearchResults);
}

export type { SearchMediaType };
