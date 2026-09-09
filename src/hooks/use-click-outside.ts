import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(
  onOutsideClick: () => void,
  enabled = true,
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(onOutsideClick);

  useEffect(() => {
    handlerRef.current = onOutsideClick;
  });

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handlerRef.current();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enabled]);

  return ref;
}
