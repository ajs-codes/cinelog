import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchPaginationProps = {
  disabled?: boolean;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
};

export function SearchPagination({
  disabled = false,
  onPageChange,
  page,
  totalPages,
}: SearchPaginationProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Button
        aria-label="Previous page"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
        variant="darkFilled"
      >
        <ChevronLeft className="size-4" />
        Prev
      </Button>
      <p className="text-xs text-outline-muted sm:text-sm">
        {page} of {totalPages}
      </p>
      <Button
        aria-label="Next page"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
        variant="darkFilled"
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
