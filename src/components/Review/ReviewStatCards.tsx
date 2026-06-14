import { BarChart3, Flame, Layers3, TrendingUp } from "lucide-react";
import type { ReviewStats } from "../../types";

export function ReviewStatCards({ stats, periodLabel }: { stats: ReviewStats; periodLabel: string }) {
  const changeText = stats.growthRate > 0 ? `+${stats.growthRate}` : String(stats.growthRate);
  const changeTone = stats.growthRate > 0 ? "text-emerald-700 bg-emerald-50" : stats.growthRate < 0 ? "text-orange-700 bg-orange-50" : "text-zinc-700 bg-zinc-100";

  const cards = [
    {
      label: `${periodLabel}完成`,
      value: `${stats.totalCards} 张`,
      hint: stats.totalCards ? "来自真实人生卡" : "等待第一张卡",
      icon: <BarChart3 size={20} />,
    },
    {
      label: "较上一周期",
      value: changeText,
      hint: `上一周期 ${stats.previousTotalCards} 张`,
      icon: <TrendingUp size={20} />,
      valueClassName: changeTone,
    },
    {
      label: "高频分类",
      value: stats.topCategory,
      hint: stats.categoryDistribution[0] ? `${stats.categoryDistribution[0].count} 次出现` : "暂无数据",
      icon: <Layers3 size={20} />,
    },
    {
      label: "常见情绪",
      value: stats.topMood,
      hint: stats.mostActiveDay !== "暂无" ? `活跃：${stats.mostActiveDay}` : "暂无趋势",
      icon: <Flame size={20} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <div key={item.label} className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">{item.icon}</span>
            <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-500">{item.hint}</span>
          </div>
          <p className="text-sm font-bold text-zinc-500">{item.label}</p>
          <p className={`mt-2 inline-flex rounded-xl px-2 text-2xl font-black text-ink ${item.valueClassName || ""}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
