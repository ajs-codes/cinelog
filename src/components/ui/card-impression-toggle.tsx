"use client";

import { SmilePlus } from "lucide-react";
import { IconPopover } from "@/components/ui/icon-popover";
import { IMPRESSION, IMPRESSION_CONFIG } from "@/lib/constants";

type CardImpressionToggleProps = {
  impression: number | null;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (impression: number | null) => void;
};

export function CardImpressionToggle({
  impression,
  disabled = false,
  loading = false,
  onSelect,
}: CardImpressionToggleProps) {
  const current =
    impression === null
      ? null
      : IMPRESSION_CONFIG[impression as keyof typeof IMPRESSION_CONFIG];

  return (
    <IconPopover
      allowDeselect
      disabled={disabled}
      loading={loading}
      onSelect={(value) => onSelect(impression === value ? null : value)}
      options={Object.values(IMPRESSION).map((option) => {
        const config =
          IMPRESSION_CONFIG[option.value as keyof typeof IMPRESSION_CONFIG];
        return {
          value: option.value,
          label: option.display_value,
          icon: config.icon,
          className: config.className,
        };
      })}
      triggerAriaLabel="Set impression"
      triggerClassName={current ? current.className : "text-outline-muted"}
      triggerIcon={SmilePlus}
      value={impression}
    />
  );
}
