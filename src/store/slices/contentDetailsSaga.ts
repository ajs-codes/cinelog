import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  detailsFailed,
  detailsRequested,
  detailsSucceeded,
  type ContentDetailsData,
} from "./contentDetailsSlice";

type DetailsResponse = ContentDetailsData & { error?: string };

function* fetchContentDetails(
  action: ReturnType<typeof detailsRequested>,
): SagaIterator {
  const { id, mediaType } = action.payload;

  try {
    const response: Response = yield call(fetch, `/api/${mediaType}/${id}`);
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

export function* contentDetailsSaga(): SagaIterator {
  yield takeLatest(detailsRequested.type, fetchContentDetails);
}
