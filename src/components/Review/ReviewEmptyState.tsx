import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function ReviewEmptyState({ periodLabel }: { periodLabel: string }) {
  return (
    <section className="rounded-2xl border border-orange-100/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
          <Sparkles size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-ink">{periodLabel}还在等第一张人生卡</h2>
          <p className="mt-2 text-sm leading-7 text-zinc-600">
            这一个周期还没有人生卡，完成一次打卡后，这里会生成你的时光映照、趋势图和代表卡。
          </p>
        </div>
        <Link to="/tasks" className="secondary-button shrink-0">去任务库看看</Link>
      </div>
    </section>
  );
}
