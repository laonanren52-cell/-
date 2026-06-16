import { ArrowRight, BarChart3 } from "lucide-react";
import type { ReviewReport } from "../../types";
import { LifeCardPreview } from "../LifeCard/LifeCardPreview";

export function ReviewPanel({ report }: { report: ReviewReport }) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_420px]">
      <section className="glass-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <BarChart3 size={22} />
          </span>
          <div>
            <h2 className="section-title">{report.title}</h2>
            <p className="text-sm text-zinc-500">真实前端统计 + AI 阶段映照</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="完成打卡" value={`${report.cardCount} 张`} />
          <Metric label="常见情绪" value={report.topMood ?? "等待记录"} />
          <Metric label="高频分类" value={report.topCategory ?? "暂无"} />
        </div>
        <div className="mt-6 rounded-2xl bg-white/80 p-5">
          <p className="text-sm font-bold text-gray-500">AI 阶段总结</p>
          <p className="mt-3 whitespace-pre-line break-words text-base leading-8 text-gray-700">{report.aiSummary}</p>
        </div>
        <div className="mt-5 rounded-2xl border border-white/90 bg-[#FBFAF7] p-5 text-[#1f1f1f] shadow-[inset_0_1px_8px_rgba(31,31,31,0.03)]">
          <p className="text-sm font-bold text-[#626262]">下一步建议</p>
          <div className="mt-3 grid gap-2">
            {report.nextSuggestions.length ? report.nextSuggestions.map((suggestion) => (
              <p key={suggestion.title} className="flex items-start gap-2 text-sm leading-6">
                <ArrowRight className="mt-1 shrink-0 text-[#25324A]" size={16} />
                <span className="break-words">{suggestion.title}：{suggestion.action}</span>
              </p>
            )) : (
              <p className="text-sm text-[#626262]">正在生成更贴近你记录的建议...</p>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">代表性人生卡</h3>
        {report.representativeCards.length ? (
          report.representativeCards.map((card) => <LifeCardPreview key={card.id} card={card} compact />)
        ) : (
          <div className="glass-card p-8 text-sm text-zinc-500">这一周期还没有卡片，下一次真实尝试会出现在这里。</div>
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
