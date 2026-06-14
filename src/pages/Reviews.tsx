import { useMemo, useState } from "react";
import { ReviewPanel } from "../components/ReviewPanel/ReviewPanel";
import { TimelineList } from "../components/Timeline/TimelineList";
import { useAppData } from "../services/AppDataContext";
import { buildReviewReport } from "../services/reviewService";
import type { ReviewPeriod } from "../types";
import { isInPeriod } from "../utils/date";

const periods: Array<{ key: ReviewPeriod; label: string; custom: boolean }> = [
  { key: "daily", label: "日复盘", custom: true },
  { key: "weekly", label: "周复盘", custom: true },
  { key: "monthly", label: "月复盘", custom: true },
  { key: "quarterly", label: "季复盘", custom: false },
  { key: "yearly", label: "年复盘", custom: false },
];

export function Reviews() {
  const { lifeCards, reviewSettings } = useAppData();
  const [period, setPeriod] = useState<ReviewPeriod>("weekly");
  const report = useMemo(() => buildReviewReport(lifeCards, period), [lifeCards, period]);
  const periodCards = lifeCards.filter((card) => isInPeriod(card.completedAt, period));

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold text-coral">复盘回溯</p>
        <h1 className="section-title mt-2">看见这一阶段，生活把你带去了哪里</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {periods.map((item) => {
            const enabled = item.custom ? reviewSettings[item.key as "daily" | "weekly" | "monthly"] : true;
            return (
              <button
                key={item.key}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  period === item.key ? "bg-ink text-white" : enabled ? "bg-white/80 text-zinc-700" : "bg-zinc-100 text-zinc-400"
                }`}
                onClick={() => setPeriod(item.key)}
                type="button"
              >
                <span>{item.label}</span>
                <span className="ml-2 text-xs opacity-70">{item.custom ? "用户可自定义" : "系统固定保留"}</span>
                {!enabled ? <span className="ml-2 text-xs">已关闭</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <ReviewPanel report={report} />

      <section>
        <h2 className="mb-4 text-lg font-black text-ink">本周期卡片墙</h2>
        <TimelineList cards={periodCards} />
      </section>
    </div>
  );
}
