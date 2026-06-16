const moodColors: Record<string, string> = {
  开心: "bg-amber-100 text-amber-800 border-amber-200",
  平静: "bg-sky-100 text-sky-800 border-sky-200",
  难过: "bg-blue-100 text-blue-800 border-blue-200",
  孤独: "bg-violet-100 text-violet-800 border-violet-200",
  紧张: "bg-rose-100 text-rose-800 border-rose-200",
  疲惫: "bg-zinc-100 text-zinc-700 border-zinc-200",
  成就感: "bg-emerald-100 text-emerald-800 border-emerald-200",
  自由: "bg-teal-100 text-teal-800 border-teal-200",
  其他: "bg-orange-100 text-orange-800 border-orange-200",
};

export function ReviewMoodChart({ data }: { data: Array<{ mood: string; count: number }> }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black text-ink">情绪分布</h2>
        <p className="mt-1 text-sm text-zinc-500">自由输入的心情会被归成可读的情绪标签。</p>
      </div>
      {data.length ? (
        <div className="flex flex-wrap gap-3">
          {data.map((item) => {
            const percent = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <span
                key={item.mood}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black ${moodColors[item.mood] || moodColors.其他}`}
              >
                {item.mood}
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs">{item.count} 次</span>
                <span className="text-xs opacity-75">{percent}%</span>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">还没有情绪记录。下一张人生卡里写一句真实心情，这里就会开始长出脉络。</p>
      )}
    </section>
  );
}
