"use client";

import { useEffect, useState } from "react";

type ContentDetailsState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
};

export function useContentDetails<T>(url: string): ContentDetailsState<T> {
  const [state, setState] = useState<ContentDetailsState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      setState({ data: null, error: null, isLoading: true });

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as T;
        setState({ data, error: null, isLoading: false });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          data: null,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to load details"),
          isLoading: false,
        });
      }
    }

    void loadDetails();

    return () => controller.abort();
  }, [url]);

  return state;
}
