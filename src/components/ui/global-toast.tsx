"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { hideToast } from "@/store/slices/toastSlice";
import { Toast } from "./toast";

export function GlobalToast() {
  const dispatch = useAppDispatch();
  const { message, variant, key } = useAppSelector((state) => state.toast);

  if (!message) return null;

  return (
    <Toast
      key={key}
      message={message}
      variant={variant}
      onDismiss={() => dispatch(hideToast())}
    />
  );
}
