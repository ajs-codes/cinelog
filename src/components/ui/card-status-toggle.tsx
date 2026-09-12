"use client";

import { IconPopover } from "@/components/ui/icon-popover";
import {
  WATCH_STATUS,
  WATCH_STATUS_ICONS,
  WATCH_STATUS_INDICATOR,
  WATCH_STATUS_INDICATOR_TEXT,
} from "@/lib/constants";

type CardStatusToggleProps = {
  watchStatus: number;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (watchStatus: number) => void;
};

export function CardStatusToggle({
  watchStatus,
  disabled = false,
  loading = false,
  onSelect,
}: CardStatusToggleProps) {
  const currentIndicator =
    WATCH_STATUS_INDICATOR[watchStatus] ?? WATCH_STATUS_INDICATOR[0];

  return (
    <IconPopover
      disabled={disabled}
      loading={loading}
      onSelect={onSelect}
      options={Object.values(WATCH_STATUS).map((option) => ({
        value: option.value,
        label: option.display_value,
        icon: WATCH_STATUS_ICONS[option.value],
        className: WATCH_STATUS_INDICATOR_TEXT[WATCH_STATUS_INDICATOR[option.value]],
      }))}
      triggerAriaLabel="Set watch status"
      triggerClassName={WATCH_STATUS_INDICATOR_TEXT[currentIndicator]}
      value={watchStatus}
    />
  );
}
