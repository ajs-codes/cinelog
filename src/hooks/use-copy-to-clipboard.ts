"use client";

import { useState } from "react";

export function useCopyToClipboard() {
  const [message, setMessage] = useState<string | null>(null);

  async function copy(
    text: string,
    successMessage = "Copied to clipboard.",
    failureMessage = "Unable to copy. Please copy the text manually.",
  ) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successMessage);
    } catch {
      setMessage(failureMessage);
    }
  }

  function clear() {
    setMessage(null);
  }

  return { message, copy, clear };
}
