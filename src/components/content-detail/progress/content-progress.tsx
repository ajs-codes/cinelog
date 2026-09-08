import { ProgressActions } from "@/components/content-detail/progress/progress-actions";
import { ProgressMetrics } from "@/components/content-detail/progress/progress-metrics";
import { ProgressStatus } from "@/components/content-detail/progress/progress-status";
import type { SeriesDetails } from "@/lib/types";
import { useAppSelector } from "@/store";

type ContentProgressProps = {
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function ContentProgress({
  series,
  type = "series",
}: ContentProgressProps) {
  const mediaId = series?.id;
  const entry = useAppSelector((state) =>
    mediaId === undefined
      ? undefined
      : state.contentDetails.series[String(mediaId)],
  );

  return (
    <section className="m-4 rounded-[22px] border border-outline-variant bg-surface-container p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-4">
      {type === "series" ? (
        <>
          <ProgressStatus
            id={mediaId}
            series={series}
            type={type}
            watchStatus={series?.watch_status}
            mutationStatus={entry?.mutationStatus}
            disabled={!series?.is_present_in_watchlist}
          />
          <div className="mt-5 h-px w-full bg-white/15" />
          <div className="mt-5">
            <ProgressMetrics series={series} />
          </div>
        </>
      ) : null}

      <div className={type === "series" ? "mt-6" : ""}>
        <ProgressActions />
      </div>
    </section>
  );
}

export default ContentProgress;
