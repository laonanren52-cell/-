import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Pin, Trash2 } from "lucide-react";
import { useAppData } from "../services/AppDataContext";
import { taskCategories } from "../data/presetTasks";
import type { WishlistStatus } from "../types";

const statuses: WishlistStatus[] = ["想做", "进行中", "已完成"];

export function Wishlist() {
  const { wishlist, updateWishlistStatus, removeWishlistItem, toggleWishlistPin } = useAppData();
  const [category, setCategory] = useState("全部");
  const [importance, setImportance] = useState("全部");

  const items = useMemo(
    () =>
      wishlist
        .filter((item) => category === "全部" || item.category === category)
        .filter((item) => importance === "全部" || (importance === "重要" ? item.isImportant : !item.isImportant))
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [category, importance, wishlist],
  );

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold text-coral">人生愿望清单</p>
        <h1 className="section-title mt-2">不是待办，是还没完成的人生支线池</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {["全部", ...taskCategories].map((item) => (
            <button key={item} className={`rounded-full px-4 py-2 text-sm font-bold ${category === item ? "bg-ink text-white" : "bg-white/80 text-zinc-600"}`} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
          {["全部", "重要", "普通"].map((item) => (
            <button key={item} className={`rounded-full px-4 py-2 text-sm font-bold ${importance === item ? "bg-coral text-white" : "bg-white/80 text-zinc-600"}`} onClick={() => setImportance(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item.id} className="glass-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{item.category}</span>
                  {item.isImportant ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">重要</span> : null}
                  {item.isPinned ? <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">置顶</span> : null}
                </div>
                <h2 className="text-xl font-black text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{item.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select className="soft-input w-auto min-w-28" value={item.status} onChange={(event) => updateWishlistStatus(item.id, event.target.value as WishlistStatus)}>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <Link className="primary-button" to={`/checkin/${item.taskId}`}>
                  完成打卡
                </Link>
                <button className="icon-button" title="置顶" onClick={() => toggleWishlistPin(item.id)}>
                  <Pin size={17} />
                </button>
                <button className="icon-button" title="编辑占位">
                  <Edit3 size={17} />
                </button>
                <button className="icon-button" title="删除" onClick={() => removeWishlistItem(item.id)}>
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
