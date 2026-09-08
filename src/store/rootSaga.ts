import type { SagaIterator } from "redux-saga";
import { searchSaga } from "./slices/searchSaga";
import { authSaga } from "./slices/authSaga";

export default function* rootSaga(): SagaIterator {
  yield* searchSaga();
  yield* authSaga();
}
