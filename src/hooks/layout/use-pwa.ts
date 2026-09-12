"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

function getStandaloneServerSnapshot() {
  return false;
}

function subscribeIos() {
  return () => {};
}

function getIosSnapshot() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !Boolean((window as unknown as { MSStream?: unknown }).MSStream)
  );
}

function getIosServerSnapshot() {
  return false;
}

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [hasDismissedPrompt, setHasDismissedPrompt] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem("cinelog-pwa-dismissed"));
  });

  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot,
  );

  const isInstalled = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  );

  const isIOS = useSyncExternalStore(
    subscribeIos,
    getIosSnapshot,
    getIosServerSnapshot,
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.error("[PWA] Service worker registration failed:", error);
        });
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("[PWA] Error triggering install prompt:", err);
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setHasDismissedPrompt(true);
    try {
      sessionStorage.setItem("cinelog-pwa-dismissed", "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isInstallable = Boolean(deferredPrompt) && !hasDismissedPrompt && !isInstalled;

  return {
    isInstallable,
    isInstalled,
    isIOS: isIOS && !isInstalled && !hasDismissedPrompt,
    isOnline,
    promptInstall,
    dismissPrompt,
  };
}
