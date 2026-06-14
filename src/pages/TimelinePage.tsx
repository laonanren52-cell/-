import { useMemo, useState } from "react";
import { ArrowDownAZ, Filter } from "lucide-react";
import { TimelineList } from "../components/Timeline/TimelineList";
import { moodOptions } from "../components/MoodTag/MoodTag";
import { taskCategories } from "../data/presetTasks";
import { useAppData } from "../services/AppDataContext";

export function TimelinePage() {
  const { lifeCards } = useAppData();
  const [category, setCategory] = useState("全部");
  const [mood, setMood] = useState("全部");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  const cards = useMemo(
    () =>
      lifeCards
        .filter((card) => category === "全部" || card.category === category)
        .filter((card) => mood === "全部" || card.moodTags.includes(mood as never))
        .sort((a, b) => (order === "desc" ? +new Date(b.completedAt) - +new Date(a.completedAt) : +new Date(a.completedAt) - +new Date(b.completedAt))),
    [category, lifeCards, mood, order],
  );

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold text-coral">人生轨迹</p>
        <h1 className="section-title mt-2">按月份回看你的卡片墙</h1>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <select className="soft-input pl-11" value={category} onChange={(event) => setCategory(event.target.value)}>
              {["全部", ...taskCategories].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <select className="soft-input" value={mood} onChange={(event) => setMood(event.target.value)}>
            {["全部", ...moodOptions].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="secondary-button justify-start" onClick={() => setOrder(order === "desc" ? "asc" : "desc")}>
            <ArrowDownAZ size={18} />
            {order === "desc" ? "按时间从新到旧" : "按时间从旧到新"}
          </button>
        </div>
      </section>
      <TimelineList cards={cards} />
    </div>
  );
}
