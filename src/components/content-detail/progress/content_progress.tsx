import { ProgressActions } from "@/components/content-detail/progress/actions";
import { ProgressMetrics } from "@/components/content-detail/progress/metrics";
import { ProgressStatus } from "@/components/content-detail/progress/status";
import type { SeriesDetails } from "@/lib/types";

type ContentProgressProps = {
  series?: SeriesDetails | null;
  type?: "movie" | "series";
};

export function ContentProgress({ series, type = "series" }: ContentProgressProps) {
  return (
    <section className="m-4 rounded-[22px] border border-outline-variant bg-surface-container p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-4">
      {type === "series" ? (
        <>
          <ProgressStatus series={series} type={type} />
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
