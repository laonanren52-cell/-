import { ArrowRight, BarChart3 } from "lucide-react";
import type { ReviewReport } from "../../types";
import { LifeCardPreview } from "../LifeCard/LifeCardPreview";

export function ReviewPanel({ report }: { report: ReviewReport }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <BarChart3 size={22} />
          </span>
          <div>
            <h2 className="section-title">{report.title}</h2>
            <p className="text-sm text-zinc-500">真实前端统计 + AI mock 复盘</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="完成打卡" value={`${report.cardCount} 张`} />
          <Metric label="常见心情" value={report.topMood ?? "等待记录"} />
          <Metric label="高频分类" value={report.topCategory ?? "暂无"} />
        </div>
        <div className="mt-6 rounded-2xl bg-white/70 p-5">
          <p className="text-sm font-bold text-zinc-500">AI 阶段总结</p>
          <p className="mt-3 text-base leading-8 text-ink">{report.aiSummary}</p>
        </div>
        <div className="mt-5 rounded-2xl bg-ink p-5 text-white">
          <p className="text-sm font-bold text-white/70">下一步建议</p>
          <div className="mt-3 grid gap-2">
            {report.nextSuggestions.map((suggestion) => (
              <p key={suggestion} className="flex items-center gap-2 text-sm">
                <ArrowRight size={16} />
                {suggestion}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-lg font-black text-ink">代表性人生卡</h3>
        {report.representativeCards.length ? (
          report.representativeCards.map((card) => <LifeCardPreview key={card.id} card={card} compact />)
        ) : (
          <div className="glass-card p-8 text-sm text-zinc-500">这一周期还没有卡片，下一次尝试会出现在这里。</div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/75 p-4">
      <p className="text-xs font-bold text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-black text-ink">{value}</p>
    </div>
  );
}
