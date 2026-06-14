import { ArrowRight, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeTask } from "../../types";

const categoryVisual: Record<string, string> = {
  第一次清单: "🎬",
  勇气清单: "🔥",
  关系清单: "💌",
  独处清单: "🌙",
  成长清单: "🌱",
  治愈清单: "☁️",
  生活观察: "🌤️",
  情绪修复: "🌿",
  校园生活: "🏫",
  隐藏成就: "📷",
  城市探索: "🌳",
};

export function TaskCard({ task, onAddTodo }: { task: LifeTask; onAddTodo: (task: LifeTask) => void }) {
  const icon = task.icon || categoryVisual[task.category] || "✨";

  return (
    <article className="glass-card flex gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush via-cream to-skysoft text-4xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-black leading-snug text-ink">{task.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600">{task.description}</p>
            {task.achievementName ? (
              <p className="mt-2 line-clamp-1 text-xs font-semibold text-orange-700">
                解锁：{task.achievementName}
                {task.unlockText ? <span className="text-zinc-500"> · {task.unlockText}</span> : null}
              </p>
            ) : null}
            {task.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {task.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-zinc-500">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{task.category}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="secondary-button px-3 py-2" type="button" onClick={() => onAddTodo(task)}>
            <Plus size={16} />
            加入待办事项
          </button>
          <Link to={`/checkin/${task.id}`} className="primary-button px-3 py-2">
            立即打卡
            <ArrowRight size={16} />
          </Link>
          <Link to={`/checkin/${task.id}`} className="secondary-button px-3 py-2">
            <Eye size={16} />
            查看详情
          </Link>
          <span className="ml-auto text-xs font-semibold text-zinc-400">{task.difficulty} · {task.suggestedDuration}</span>
        </div>
      </div>
    </article>
  );
}
