import { Check, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProgressActions() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Button
        type="button"
        variant="primaryFilled"
        className="h-14 justify-center gap-2 rounded-xl border border-brand-primary-container/40 bg-brand-primary-container px-4 text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-brand-primary-container/90"
      >
        <Check className="h-4 w-4" />
        Mark Ep 7 Watched
      </Button>

      <Button
        type="button"
        variant="darkFilled"
        className="h-14 justify-center gap-2 rounded-xl border border-white/10 bg-surface-container-high/70 px-4 text-base font-semibold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-surface-container-high"
      >
        <CheckCheck className="h-4 w-4 text-brand-tertiary-accent-alt" />
        Mark Season 1 Watched
      </Button>
    </div>
  );
}

export default ProgressActions;
