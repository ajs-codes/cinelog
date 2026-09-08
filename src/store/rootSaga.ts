import type { SagaIterator } from "redux-saga";
import { contentDetailsSaga } from "./slices/contentDetailsSaga";
import { searchSaga } from "./slices/searchSaga";
import { authSaga } from "./slices/authSaga";
import { librarySaga } from "./slices/librarySaga";

export default function* rootSaga(): SagaIterator {
  yield* searchSaga();
  yield* authSaga();
  yield* contentDetailsSaga();
  yield* librarySaga();
}
