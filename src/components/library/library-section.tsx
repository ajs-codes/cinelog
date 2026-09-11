import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function LibrarySection({
  title,
  count,
  hasMore,
  loadingMore,
  onLoadMore,
  children,
}: {
  title: string;
  count: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  const headingId = `${title.toLowerCase()}-heading`;

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-4">
      {count > 0 ? (
        <>
          <div className="grid grid-cols-2 justify-items-stretch gap-3 sm:grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] sm:gap-x-4 sm:gap-y-6">
            {children}
          </div>
          {hasMore ? (
            <div className="flex justify-center pt-2">
              <Button
                className="min-w-32"
                disabled={loadingMore}
                onClick={onLoadMore}
                type="button"
                variant="darkFilled"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {loadingMore ? "Loading" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          className="px-4 py-8"
          description={`No ${title.toLowerCase()} in your watchlist yet.`}
        />
      )}
    </section>
  );
}
