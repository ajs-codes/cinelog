"use client";

import Image from "next/image";
import { Download, WifiOff, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/hooks/layout/use-pwa";

export function PwaManager() {
  const {
    isInstallable,
    isIOS,
    isOnline,
    promptInstall,
    dismissPrompt,
  } = usePwa();

  return (
    <>
      {/* Offline Status Toast */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-status-error/40 bg-surface-container-high px-4 py-2 text-xs font-medium text-status-error shadow-lg backdrop-blur-md transition-all duration-200 lg:bottom-6"
        >
          <WifiOff className="size-3.5 shrink-0" />
          <span>You are currently offline. Cached content is available.</span>
        </div>
      )}

      {/* PWA Install Banner for Chrome / Android / Desktop */}
      {isInstallable && (
        <div
          role="dialog"
          aria-label="Install CineLog"
          className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 lg:bottom-6 lg:right-6 lg:left-auto"
        >
          <div className="flex items-center justify-between gap-3.5 rounded-2xl border border-outline-alt bg-surface-container-low/95 p-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-outline-alt bg-surface-container shadow-xs">
                <Image
                  src="/icon.svg"
                  alt="CineLog App Icon"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface">
                  Install CineLog App
                </p>
                <p className="truncate text-xs text-secondary">
                  Fast, offline-ready cinema tracker
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="primaryFilled"
                onClick={promptInstall}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <Download className="size-3.5" />
                <span>Install</span>
              </Button>
              <button
                type="button"
                onClick={dismissPrompt}
                aria-label="Dismiss install prompt"
                className="flex size-7 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Add to Home Screen Instructions */}
      {isIOS && (
        <div
          role="dialog"
          aria-label="Install on iOS"
          className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-outline-alt bg-surface-container-low/95 p-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-outline-alt bg-surface-container shadow-xs">
                <Image
                  src="/icon.svg"
                  alt="CineLog App Icon"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="text-xs text-on-surface">
                <p className="font-semibold">Install CineLog on iOS</p>
                <p className="mt-0.5 text-secondary">
                  Tap <Share className="inline size-3.5 text-brand-primary" />{" "}
                  Share and choose{" "}
                  <span className="font-medium text-on-surface">
                    &ldquo;Add to Home Screen&rdquo;
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissPrompt}
              aria-label="Dismiss iOS install instructions"
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
