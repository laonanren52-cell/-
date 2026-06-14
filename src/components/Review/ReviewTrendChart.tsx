export function ReviewTrendChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  const compact = data.length > 18;

  return (
    <section className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black text-ink">完成趋势</h2>
        <p className="mt-1 text-sm text-zinc-500">按当前复盘周期自动切换粒度。</p>
      </div>
      <div className="flex h-48 items-end gap-2 overflow-x-auto rounded-2xl bg-orange-50/70 px-3 pb-4 pt-6">
        {data.map((item) => {
          const height = item.count ? Math.max((item.count / max) * 100, 18) : 8;
          return (
            <div key={item.date} className="flex h-full min-w-[24px] flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-black text-zinc-500">{item.count || ""}</span>
              <div
                className={`w-full rounded-t-xl transition ${item.count ? "bg-coral" : "bg-white"}`}
                style={{ height: `${height}%` }}
                title={`${item.date}: ${item.count}`}
              />
              <span className={`w-full truncate text-center text-[11px] font-bold text-zinc-500 ${compact ? "hidden sm:block" : ""}`}>{item.date}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
