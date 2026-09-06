import type { SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";
import movieSaga from "./slices/movieSaga";

export default function* rootSaga(): SagaIterator {
  yield all([fork(movieSaga)]);
}
