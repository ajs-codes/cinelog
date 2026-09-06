import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import type { Movie } from "@/db/schema";
import {
  addMovieRequested,
  fetchMoviesFailed,
  fetchMoviesRequested,
  fetchMoviesSucceeded,
} from "./movieSlice";

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

function* fetchMoviesWorker(): SagaIterator {
  try {
    const response: Response = yield call(fetch, "/api/movies");
    const movies: Movie[] = yield call(readResponse<Movie[]>, response);
    yield put(fetchMoviesSucceeded(movies));
  } catch (error) {
    yield put(
      fetchMoviesFailed(
        error instanceof Error ? error.message : "Request failed",
      ),
    );
  }
}

function* addMovieWorker(
  action: ReturnType<typeof addMovieRequested>,
): SagaIterator {
  try {
    const response: Response = yield call(fetch, "/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action.payload),
    });
    yield call(readResponse<Movie>, response);
    yield put(fetchMoviesRequested());
  } catch (error) {
    yield put(
      fetchMoviesFailed(
        error instanceof Error ? error.message : "Request failed",
      ),
    );
  }
}

export default function* movieSaga(): SagaIterator {
  yield takeLatest(fetchMoviesRequested.type, fetchMoviesWorker);
  yield takeLatest(addMovieRequested.type, addMovieWorker);
}
