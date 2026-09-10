import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastVariant = "info" | "success" | "error";

export type ToastState = {
  message: string | null;
  variant: ToastVariant;
  key: number;
};

const initialState: ToastState = {
  message: null,
  variant: "success",
  key: 0,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        variant?: ToastVariant;
      }>,
    ) => {
      state.message = action.payload.message;
      state.variant = action.payload.variant ?? "success";
      state.key = Date.now();
    },
    hideToast: (state) => {
      state.message = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
