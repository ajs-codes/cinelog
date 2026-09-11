import { AlertCircle, Check, Info } from "lucide-react";

export const VARIANT_CONFIG = {
  success: {
    icon: Check,
    iconBg: "bg-status-success/15 text-status-success",
    border: "border-status-success/35",
  },
  info: {
    icon: Info,
    iconBg: "bg-status-info/15 text-status-info",
    border: "border-status-info/35",
  },
  error: {
    icon: AlertCircle,
    iconBg: "bg-status-error/15 text-status-error",
    border: "border-status-error/35",
  },
} as const;
