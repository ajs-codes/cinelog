import { ProgressActions } from "@/components/title-detail/progress/actions";
import { ProgressMetrics } from "@/components/title-detail/progress/metrics";
import { ProgressStatus } from "@/components/title-detail/progress/status";

export function TitleProgress() {
  return (
    <section className="m-4 rounded-[22px] border border-outline-variant bg-surface-container p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-6 font-body">
      <ProgressStatus />

      <div className="mt-5 h-px w-full bg-white/15" />

      <div className="mt-5">
        <ProgressMetrics />
      </div>

      <div className="mt-6">
        <ProgressActions />
      </div>
    </section>
  );
}

export default TitleProgress;
