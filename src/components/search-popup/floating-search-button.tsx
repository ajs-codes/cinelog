import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingSearchButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="primaryFilled"
      aria-label="Search movies"
      className={cn(
        "fixed right-6 bottom-6 z-50 size-14 rounded-xl shadow-[0_4px_8px_rgb(0_0_0/30%)]",
        className,
      )}
      size="icon-lg"
      title="Search movies"
      type="button"
      {...props}
    >
      <Search className="size-6" strokeWidth={2} />
    </Button>
  );
}
