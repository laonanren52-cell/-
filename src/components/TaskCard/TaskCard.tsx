import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeTask } from "../../types";
import { DotPattern } from "../ui/DotPattern";

export function TaskCard({ task, onAddTodo }: { task: LifeTask; onAddTodo: (task: LifeTask) => void }) {
  const icon = task.icon || "·";

  return (
    <article className="group grid gap-4 overflow-hidden rounded-[32px] border border-white/80 bg-[#FBFAF7] p-4 shadow-[0_12px_40px_rgba(30,30,30,0.06)] transition duration-500 hover:-translate-y-1 hover:bg-white md:grid-cols-[150px_1fr]">
      <div className="relative min-h-[142px] overflow-hidden rounded-[26px] bg-[#EEF1EC]">
        <DotPattern opacity={0.24} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.92),transparent_34%),radial-gradient(circle_at_70%_80%,rgba(232,182,139,0.22),transparent_36%)]" />
        <div className="relative z-10 flex h-full items-center justify-center text-5xl transition duration-700 group-hover:scale-110">{icon}</div>
      </div>

      <div className="min-w-0 p-1 md:p-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black text-[#A8B8AE]">{task.category}</p>
            <h3 className="mt-2 text-xl font-black leading-snug text-[#1f1f1f]">{task.title}</h3>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#626262] shadow-[inset_0_1px_6px_rgba(31,31,31,0.04)]">
            {task.difficulty} · {task.suggestedDuration}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-medium leading-7 text-[#626262]">{task.description}</p>

        {task.achievementName ? (
          <p className="mt-3 line-clamp-2 rounded-[20px] bg-white/75 px-4 py-3 text-xs font-bold leading-5 text-[#626262]">
            <span className="text-[#1f1f1f]">解锁：{task.achievementName}</span>
            {task.unlockText ? <span> · {task.unlockText}</span> : null}
          </p>
        ) : null}

        {task.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {task.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-[#F2F0EA] px-2.5 py-1 text-[11px] font-bold text-[#626262]">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button className="secondary-button px-4 py-2.5" type="button" onClick={() => onAddTodo(task)}>
            <Plus size={16} />
            加入待办
          </button>
          <Link to={`/checkin/${task.id}`} className="primary-button px-4 py-2.5">
            去打卡
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
