"use client";

import { useRef } from "react";

export function useHorizontalScroll(amount = 400) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    ref.current?.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return { ref, scroll };
}
