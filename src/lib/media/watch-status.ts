import { Check, Clock, Play, X } from "lucide-react";

import type { BadgeIndicator } from "@/lib/types";

export const WATCH_STATUS_INDICATOR: Record<number, BadgeIndicator> = {
  0: "accentAlt",
  1: "info",
  2: "success",
  3: "error",
};

export const WATCH_STATUS_ICONS = {
  0: Clock,
  1: Play,
  2: Check,
  3: X,
} as const;

export const WATCH_STATUS_INDICATOR_BG: Record<BadgeIndicator, string> = {
  success: "bg-status-success",
  info: "bg-status-info",
  error: "bg-status-error",
  accentAlt: "bg-brand-tertiary-accent-alt",
};

export const WATCH_STATUS_INDICATOR_TEXT: Record<BadgeIndicator, string> = {
  success: "text-status-success",
  info: "text-status-info",
  error: "text-status-error",
  accentAlt: "text-brand-tertiary-accent-alt",
};
