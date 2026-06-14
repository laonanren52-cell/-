import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Clock } from "lucide-react";
import { useAppData } from "../services/AppDataContext";
import { daysBetween, formatDate } from "../utils/date";

export function Anniversaries() {
  const { anniversaries, addAnniversary } = useAppData();
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    type: "countDown" as "countUp" | "countDown",
    description: "",
  });

  const today = anniversaries.filter((item) => Math.abs(daysBetween(item.date)) === 0);
  const upcoming = anniversaries.filter((item) => daysBetween(item.date) > 0).sort((a, b) => daysBetween(a.date) - daysBetween(b.date));
  const past = anniversaries.filter((item) => daysBetween(item.date) < 0 || item.type === "countUp").sort((a, b) => daysBetween(a.date) - daysBetween(b.date));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    addAnniversary({
      title: form.title,
      date: new Date(form.date).toISOString(),
      type: form.type,
      source: "manual",
      description: form.description || "一个值得被记住的生活节点。",
    });
    setForm({ title: "", date: new Date().toISOString().slice(0, 10), type: "countDown", description: "" });
  }

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold text-coral">纪念日</p>
        <h1 className="section-title mt-2">把重要时刻变成可回看的节点</h1>
      </section>

      <form className="glass-card grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-5" onSubmit={submit}>
        <input className="soft-input" placeholder="纪念日标题" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <input className="soft-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        <select className="soft-input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as "countUp" | "countDown" })}>
          <option value="countUp">正数日</option>
          <option value="countDown">倒数日</option>
        </select>
        <input className="soft-input" placeholder="描述" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <button className="primary-button" type="submit">
          <CalendarPlus size={18} />
          添加
        </button>
      </form>

      <AnniversarySection title="今日纪念日" items={today} />
      <AnniversarySection title="即将到来" items={upcoming} />
      <AnniversarySection title="已过去的纪念节点" items={past} />
    </div>
  );
}

function AnniversarySection({ title, items }: { title: string; items: ReturnType<typeof useAppData>["anniversaries"] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-black text-ink">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length ? (
          items.map((item) => {
            const diff = daysBetween(item.date);
            const text = item.type === "countDown" ? `还有 ${Math.max(diff, 0)} 天` : `已经过去 ${Math.abs(diff)} 天`;
            return (
              <article key={item.id} className="glass-card p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-coral">
                  <Clock size={16} />
                  {text}
                </p>
                <h3 className="text-xl font-black text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{formatDate(item.date)} · {item.source === "fromLifeCard" ? "来自人生卡" : "手动添加"}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-600">{item.description}</p>
                {item.relatedCardId ? (
                  <Link className="secondary-button mt-4 w-full" to={`/cards/${item.relatedCardId}`}>
                    查看关联人生卡
                  </Link>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="glass-card p-6 text-sm text-zinc-500">这里暂时没有节点。</div>
        )}
      </div>
    </section>
  );
}
