import { ArrowRight, Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeTask } from "../../types";

export function TaskCard({ task, onAddWishlist }: { task: LifeTask; onAddWishlist: (task: LifeTask) => void }) {
  return (
    <article className="glass-card flex h-full flex-col gap-4 p-5 transition hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{task.category}</p>
          <h3 className="text-lg font-black leading-snug text-ink">{task.title}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500">{task.difficulty}</span>
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-zinc-600">{task.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Link to={`/checkin/${task.id}`} className="primary-button flex-1">
          开始打卡
          <ArrowRight size={17} />
        </Link>
        <button className="secondary-button px-3" type="button" onClick={() => onAddWishlist(task)} title="加入人生愿望清单">
          {task.status === "wishlist" ? <Heart size={17} fill="currentColor" /> : <Plus size={17} />}
        </button>
      </div>
      <p className="text-xs text-zinc-400">预计：{task.suggestedDuration}</p>
    </article>
  );
}
