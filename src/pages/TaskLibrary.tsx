import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { TaskCard } from "../components/TaskCard/TaskCard";
import { useAppData } from "../services/AppDataContext";
import { taskCategories } from "../data/presetTasks";
import type { Difficulty } from "../types";

const difficulties: Difficulty[] = ["轻松", "中等", "挑战"];

export function TaskLibrary() {
  const { tasks, addTaskToWishlist, createCustomTask } = useAppData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "成长清单",
    suggestedDuration: "30 分钟",
    difficulty: "中等" as Difficulty,
    isImportant: false,
  });

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const hitQuery = task.title.includes(query) || task.description.includes(query);
        const hitCategory = category === "全部" || task.category === category;
        return hitQuery && hitCategory;
      }),
    [category, query, tasks],
  );

  function submitCustomTask(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    const task = createCustomTask(form);
    addTaskToWishlist(task);
    setForm({ title: "", description: "", category: "成长清单", suggestedDuration: "30 分钟", difficulty: "中等", isImportant: false });
    setShowForm(false);
  }

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-coral">人生任务库</p>
            <h1 className="section-title mt-2">从一个可完成的小尝试开始</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">预设任务和自定义愿望都可以直接打卡，也可以先加入人生愿望清单。</p>
          </div>
          <button type="button" className="primary-button" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            创建自定义任务
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input className="soft-input pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务、第一次、关系、成长..." />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["全部", ...taskCategories].map((item) => (
              <button
                key={item}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${category === item ? "bg-ink text-white" : "bg-white/80 text-zinc-600"}`}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {showForm ? (
        <form className="glass-card grid grid-cols-1 gap-4 p-6 md:grid-cols-2" onSubmit={submitCustomTask}>
          <input className="soft-input" placeholder="任务名称" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <select className="soft-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {taskCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input className="soft-input" placeholder="预计完成时间" value={form.suggestedDuration} onChange={(event) => setForm({ ...form, suggestedDuration: event.target.value })} />
          <select className="soft-input" value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })}>
            {difficulties.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <textarea
            className="soft-input min-h-28 md:col-span-2"
            placeholder="任务描述"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
            <input type="checkbox" checked={form.isImportant} onChange={(event) => setForm({ ...form, isImportant: event.target.checked })} />
            设为重要任务
          </label>
          <button className="primary-button md:justify-self-end" type="submit">
            创建并加入愿望
          </button>
        </form>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} onAddWishlist={addTaskToWishlist} />
        ))}
      </div>
    </div>
  );
}
