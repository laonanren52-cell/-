import { useMemo, useState } from "react";
import { ArrowDownAZ, Filter } from "lucide-react";
import { TimelineList } from "../components/Timeline/TimelineList";
import { DotPattern } from "../components/ui/DotPattern";
import { taskCategories } from "../data/presetTasks";
import { useAppData } from "../services/AppDataContext";

export function TimelinePage() {
  const { lifeCards } = useAppData();
  const [category, setCategory] = useState("全部");
  const [mood, setMood] = useState("全部");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const moodOptions = useMemo(() => [...new Set(lifeCards.map((card) => card.moodText).filter(Boolean))], [lifeCards]);

  const cards = useMemo(
    () =>
      lifeCards
        .filter((card) => category === "全部" || card.category === category)
        .filter((card) => mood === "全部" || card.moodText === mood || card.moodText?.includes(mood))
        .sort((a, b) => (order === "desc" ? +new Date(b.completedAt) - +new Date(a.completedAt) : +new Date(a.completedAt) - +new Date(b.completedAt))),
    [category, lifeCards, mood, order],
  );

  return (
    <div className="page-shell space-y-6">
      <section className="paper-card relative overflow-hidden p-6 md:p-8">
        <DotPattern opacity={0.18} />
        <div className="relative z-10">
          <p className="text-sm font-black text-[#A8B8AE]">生活切片</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f1f1f] md:text-5xl">按月份回看你的真实记录</h1>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#626262]" size={18} />
              <select className="soft-input pl-11" value={category} onChange={(event) => setCategory(event.target.value)}>
                {["全部", ...taskCategories.filter((item) => item !== "全部")].map((item) => <option key={item}>{item}</option>)}
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
        </div>
      </section>
      <TimelineList cards={cards} />
    </div>
  );
}
