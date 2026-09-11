"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect, useRef } from "react";
import { initAuthRequest } from "@/store/slices/authSlice";
import { GlobalToast } from "@/components/layout/global-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    store.dispatch(initAuthRequest());
  }, []);

  return (
    <Provider store={store}>
      {children}
      <GlobalToast />
    </Provider>
  );
}
