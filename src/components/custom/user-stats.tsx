const statCards = [
  {
    label: "Total watch hours",
    value: "2,840",
    detail: "hrs",
    note: "+14 hrs this week",
    tone: "text-brand-tertiary",
  },
  {
    label: "Cinema allocation",
    value: "1,420",
    detail: "hrs in Movies",
    note: "Movies 50%  •  Series 32%  •  Anime 18%",
    tone: "text-brand-primary",
  },
  {
    label: "Titles cataloged",
    value: "3,482",
    detail: "across 12 archives",
    note: "All cloud backups verified",
    tone: "text-status-success",
  },
  {
    label: "Dominant domain",
    value: "Sci-Fi / Cyber",
    detail: "412 titles logged",
    note: "28.4% share",
    tone: "text-brand-tertiary",
  },
] as const;

export function UserStats() {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Library statistics"
    >
      {statCards.map((stat) => (
        <article
          key={stat.label}
          className="flex min-h-[142px] flex-col justify-between rounded-lg bg-surface-container-low p-5 shadow-[0_1px_2px_rgb(0_0_0/20%)]"
        >
          <p className="font-public-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
            {stat.label}
          </p>
          <div>
            <p className="mt-2 font-heading text-2xl font-semibold tracking-tight text-on-surface">
              {stat.value}{" "}
              <span className="font-public-sans text-xs font-normal text-secondary">
                {stat.detail}
              </span>
            </p>
            <p className={`mt-3 font-public-sans text-[10px] ${stat.tone}`}>
              {stat.note}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
