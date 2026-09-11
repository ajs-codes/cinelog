"use client";

import { useState, type MouseEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

export function usePopover(disabled = false) {
  const [rawOpen, setRawOpen] = useState(false);
  const isOpen = rawOpen && !disabled;
  const containerRef = useClickOutside<HTMLDivElement>(
    () => setRawOpen(false),
    isOpen,
  );

  function toggle(event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (disabled) return;
    setRawOpen((open) => !open);
  }

  function close() {
    setRawOpen(false);
  }

  return { isOpen, setIsOpen: setRawOpen, containerRef, toggle, close };
}
