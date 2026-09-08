import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  loginRequest,
  signupRequest,
  authSuccess,
  authFailure,
  logoutRequest,
  logoutSuccess,
  initAuthRequest,
  initAuthFailure
} from "./authSlice";
import type { LoginInput, SignupInput } from "@/lib/validations/auth";

async function loginApi(payload: LoginInput) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json();
}

async function signupApi(payload: SignupInput) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Signup failed");
  }
  return res.json();
}

async function meApi() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

async function logoutApi() {
  await fetch("/api/auth/logout", { method: "POST" });
}

function* handleLogin(action: PayloadAction<LoginInput>): SagaIterator {
  try {
    const data = yield call(loginApi, action.payload);
    yield put(authSuccess({ user: data.user }));
    window.location.href = "/";
  } catch (error: any) {
    yield put(authFailure(error.message));
  }
}

function* handleSignup(action: PayloadAction<SignupInput>): SagaIterator {
  try {
    const data = yield call(signupApi, action.payload);
    yield put(authSuccess({ user: data.user }));
    window.location.href = "/";
  } catch (error: any) {
    yield put(authFailure(error.message));
  }
}

function* handleLogout(): SagaIterator {
  try {
    yield call(logoutApi);
    yield put(logoutSuccess());
    window.location.href = "/login";
  } catch (error: any) {
    // Force logout on client even if API fails
    yield put(logoutSuccess());
    window.location.href = "/login";
  }
}

function* handleInit(): SagaIterator {
  try {
    const data = yield call(meApi);
    yield put(authSuccess({ user: data.user }));
  } catch (error: any) {
    yield put(initAuthFailure());
  }
}

export function* authSaga(): SagaIterator {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(signupRequest.type, handleSignup);
  yield takeLatest(logoutRequest.type, handleLogout);
  yield takeLatest(initAuthRequest.type, handleInit);
}
