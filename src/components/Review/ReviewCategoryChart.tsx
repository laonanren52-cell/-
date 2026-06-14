export function ReviewCategoryChart({ data }: { data: Array<{ category: string; count: number }> }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black text-ink">分类分布</h2>
        <p className="mt-1 text-sm text-zinc-500">看看这一阶段的生活支线偏向哪里。</p>
      </div>
      <div className="space-y-4">
        {data.length ? data.map((item, index) => (
          <div key={item.category}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-bold text-zinc-700">{item.category}</span>
              <span className="shrink-0 font-black text-ink">{item.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-orange-50">
              <div
                className={`h-full rounded-full ${index % 3 === 0 ? "bg-coral" : index % 3 === 1 ? "bg-orange-300" : "bg-amber-300"}`}
                style={{ width: `${Math.max((item.count / max) * 100, 8)}%` }}
              />
            </div>
          </div>
        )) : (
          <p className="rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">这一周期还没有分类数据，完成一次打卡后这里会出现比例条。</p>
        )}
      </div>
    </section>
  );
}
