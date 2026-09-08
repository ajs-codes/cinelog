import type { SagaIterator } from "redux-saga";
import { contentDetailsSaga } from "./slices/contentDetailsSaga";
import { searchSaga } from "./slices/searchSaga";

export default function* rootSaga(): SagaIterator {
  yield* searchSaga();
  yield* contentDetailsSaga();
}
