import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  detailsFailed,
  detailsRequested,
  detailsSucceeded,
  mutationFailed,
  mutationRequested,
  mutationSucceeded,
  type ContentDetailsData,
} from "./contentDetailsSlice";

type DetailsResponse = ContentDetailsData & { error?: string };

function* fetchContentDetails(
  action: ReturnType<typeof detailsRequested>,
): SagaIterator {
  const { id, mediaType } = action.payload;

  try {
    const response: Response = yield call(fetch, `/api/${mediaType}/${id}`, {
      cache: "no-store",
    });
    const data: DetailsResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Content details request failed");
    }

    yield put(detailsSucceeded({ data, id, mediaType }));
  } catch (error) {
    yield put(
      detailsFailed({
        error:
          error instanceof Error
            ? error.message
            : "Content details request failed",
        id,
        mediaType,
      }),
    );
  }
}

function* mutateContentDetails(
  action: ReturnType<typeof mutationRequested>,
): SagaIterator {
  const { id, mediaType, mutation, value, content } = action.payload;
  const method =
    mutation === "add-watchlist"
      ? "POST"
      : mutation === "remove-watchlist"
        ? "DELETE"
        : "PATCH";
  const body =
    mutation === "add-watchlist"
      ? content
      : mutation === "update-impression"
        ? { impression: value }
        : undefined;

  try {
    if (mutation === "add-watchlist" && !content) {
      throw new Error("Content details are unavailable");
    }

    const response: Response = yield call(fetch, `/api/${mediaType}/${id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data: { error?: string } = yield call([response, "json"]);
    if (!response.ok) throw new Error(data.error ?? "Content update failed");

    yield put(
      mutationSucceeded({
        id,
        mediaType,
        data:
          mutation === "add-watchlist"
            ? { is_present_in_watchlist: true }
            : mutation === "remove-watchlist"
              ? { is_present_in_watchlist: false }
              : { impression: value ?? null },
      }),
    );
  } catch (error) {
    yield put(
      mutationFailed({
        id,
        mediaType,
        error: error instanceof Error ? error.message : "Content update failed",
      }),
    );
  }
}

export function* contentDetailsSaga(): SagaIterator {
  yield takeLatest(detailsRequested.type, fetchContentDetails);
  yield takeLatest(mutationRequested.type, mutateContentDetails);
}
