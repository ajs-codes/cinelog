import type { SagaIterator } from "redux-saga";
import { searchSaga } from "./slices/searchSaga";

export default function* rootSaga(): SagaIterator {
  yield* searchSaga();
}
