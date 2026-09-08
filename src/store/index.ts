import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./rootSaga";
import contentDetailsReducer from "./slices/contentDetailsSlice";
import searchReducer from "./slices/searchSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    contentDetails: contentDetailsReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
