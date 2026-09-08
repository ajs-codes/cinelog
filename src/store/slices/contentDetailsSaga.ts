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
import { libraryRequested } from "./librarySlice";

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
  const { id, mediaType, mutation, value, content, progress } = action.payload;
  const method = mutation === "add-watchlist" ? "POST" : "PATCH";
  const body =
    mutation === "add-watchlist"
      ? content
      : mutation === "update-impression"
        ? { impression: value }
        : mutation === "update-watch-status"
          ? { watch_status: value }
          : mutation === "update-progress" && progress
            ? {
                mark_season_to_watched: progress.seasonNumber,
                mark_episode_to_watched: progress.episodeNumber,
              }
          : undefined;

  try {
    if (mutation === "add-watchlist" && !content) {
      throw new Error("Content details are unavailable");
    }
    if (mutation === "update-progress" && (!progress || mediaType !== "series")) {
      throw new Error("Series progress details are unavailable");
    }

    const response: Response = yield call(fetch, `/api/${mediaType}/${id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data: { error?: string } = yield call([response, "json"]);
    if (!response.ok) throw new Error(data.error ?? "Content update failed");

    const refreshSeriesDetails =
      mediaType === "series" &&
      (mutation === "update-progress" ||
        mutation === "update-watch-status");

    if (mutation === "add-watchlist") {
      yield put(libraryRequested());
    }

    if (refreshSeriesDetails) {
      yield put(libraryRequested());

      const detailsResponse: Response = yield call(
        fetch,
        `/api/${mediaType}/${id}`,
        { cache: "no-store" },
      );
      const detailsData: DetailsResponse = yield call([
        detailsResponse,
        "json",
      ]);

      if (!detailsResponse.ok) {
        throw new Error(
          detailsData.error ?? "Updated content details request failed",
        );
      }

      yield put(detailsSucceeded({ data: detailsData, id, mediaType }));
      return;
    }

    yield put(
      mutationSucceeded({
        id,
        mediaType,
        data:
          mutation === "add-watchlist"
            ? { is_present_in_watchlist: true }
            : mutation === "update-watch-status"
              ? { watch_status: value ?? 0 }
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
