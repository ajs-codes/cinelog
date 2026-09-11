type BadgeIndicator = "success" | "info" | "error" | "accentAlt";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  duration?: number;
  variant?: "info" | "success" | "error";
};

export type { BadgeIndicator, ToastProps };
