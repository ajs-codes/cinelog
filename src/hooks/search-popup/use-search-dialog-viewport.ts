"use client";

import { useEffect, useState } from "react";
import {
  SEARCH_DIALOG_INSET_PX,
  SEARCH_DIALOG_MAX_HEIGHT_PX,
} from "@/lib/constants";

type SearchDialogViewport = {
  height: number;
  top: number;
};

function getSearchDialogViewport(): SearchDialogViewport {
  const viewport = window.visualViewport;
  const viewportHeight = viewport?.height ?? window.innerHeight;
  const offsetTop = viewport?.offsetTop ?? 0;
  const available = Math.max(0, viewportHeight - SEARCH_DIALOG_INSET_PX * 2);

  return {
    height: Math.min(SEARCH_DIALOG_MAX_HEIGHT_PX, available),
    top: offsetTop + SEARCH_DIALOG_INSET_PX,
  };
}

function getFallbackViewport(): SearchDialogViewport {
  return {
    height: SEARCH_DIALOG_MAX_HEIGHT_PX,
    top: SEARCH_DIALOG_INSET_PX,
  };
}

export function useSearchDialogViewport(open: boolean) {
  const [box, setBox] = useState<SearchDialogViewport>(() =>
    typeof window === "undefined"
      ? getFallbackViewport()
      : getSearchDialogViewport(),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function update() {
      setBox(getSearchDialogViewport());
    }

    update();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return box;
}
