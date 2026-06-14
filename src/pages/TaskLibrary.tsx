import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Shuffle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { TaskCard } from "../components/TaskCard/TaskCard";
import { useAppData } from "../services/AppDataContext";
import { dismissTaskForToday, getTodayRecommendedTasks, refreshRecommendedTasks, replaceRecommendedTask } from "../services/recommendService";
import { taskCategories } from "../data/presetTasks";
import type { Difficulty, LifeTask } from "../types";

const difficulties: Difficulty[] = ["轻松", "中等", "挑战"];

export function TaskLibrary() {
  const { tasks, addTaskToTodos, createCustomTask } = useAppData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [recommendedTasks, setRecommendedTasks] = useState<LifeTask[]>([]);
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

  useEffect(() => {
    setRecommendedTasks(getTodayRecommendedTasks(tasks, { category }));
  }, [category, tasks]);

  function submitCustomTask(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    const task = createCustomTask(form);
    addTaskToTodos(task);
    setForm({ title: "", description: "", category: "成长清单", suggestedDuration: "30 分钟", difficulty: "中等", isImportant: false });
    setShowForm(false);
  }

  function refreshRecommendations() {
    setRecommendedTasks(refreshRecommendedTasks(tasks, { category }));
  }

  function replaceRecommendation(task: LifeTask) {
    setRecommendedTasks((current) => replaceRecommendedTask(tasks, task, current, { category }));
  }

  function dismissRecommendation(task: LifeTask) {
    setRecommendedTasks((current) => dismissTaskForToday(tasks, task, current, { category }));
  }

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-coral">人生任务库</p>
            <h1 className="section-title mt-2">挑一件今天能完成的小支线</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">
              任务条目改成了更轻的左图右文布局：先看任务，再决定加入待办或立即打卡。
            </p>
          </div>
          <button type="button" className="primary-button" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            创建每日待办来源
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input className="soft-input pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索天空、独处、关系、成长..." />
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

      <section className="glass-card p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-coral">今日随机小支线</p>
            <h2 className="section-title mt-1">地球 Online 今日刷新</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              每天保留一组 4 条任务，混合轻松 / 中等 / 挑战。已完成任务会降低推荐权重，不感兴趣的任务今天不会再出现。
            </p>
          </div>
          <button type="button" className="secondary-button shrink-0" onClick={refreshRecommendations}>
            <Shuffle size={18} />
            换一批
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommendedTasks.map((task) => (
            <article key={task.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="flex items-start gap-3 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                  {task.icon || "✨"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-orange-700">{task.category}</p>
                  <h3 className="mt-1 line-clamp-2 text-base font-black leading-6 text-ink">{task.title}</h3>
                </div>
              </div>
              <div className="space-y-3 px-4 pb-4">
                <p className="line-clamp-2 text-sm leading-6 text-zinc-600">{task.description}</p>
                <p className="line-clamp-2 text-xs font-semibold leading-5 text-zinc-500">
                  <span className="text-orange-700">解锁：{task.achievementName}</span>
                  {task.unlockText ? ` · ${task.unlockText}` : ""}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(task.tags ?? []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-400">
                  <span>{task.difficulty} · {task.suggestedDuration}</span>
                  {task.status === "completed" ? <span className="text-emerald-600">已完成</span> : null}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/checkin/${task.id}`} className="primary-button justify-center px-3 py-2 text-xs">
                    去打卡
                  </Link>
                  <button className="secondary-button justify-center px-3 py-2 text-xs" type="button" onClick={() => addTaskToTodos(task)}>
                    <Plus size={14} />
                    待办
                  </button>
                  <button className="secondary-button justify-center px-3 py-2 text-xs" type="button" onClick={() => replaceRecommendation(task)}>
                    <RefreshCw size={14} />
                    换掉这条
                  </button>
                  <button className="secondary-button justify-center px-3 py-2 text-xs text-zinc-500" type="button" onClick={() => dismissRecommendation(task)}>
                    <X size={14} />
                    不感兴趣
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showForm ? (
        <form className="glass-card grid grid-cols-1 gap-4 p-6 md:grid-cols-2" onSubmit={submitCustomTask}>
          <input className="soft-input" placeholder="任务名称" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <select className="soft-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {taskCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="soft-input" placeholder="预计完成时间" value={form.suggestedDuration} onChange={(event) => setForm({ ...form, suggestedDuration: event.target.value })} />
          <select className="soft-input" value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })}>
            {difficulties.map((item) => <option key={item}>{item}</option>)}
          </select>
          <textarea className="soft-input min-h-28 md:col-span-2" placeholder="任务描述" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
            <input type="checkbox" checked={form.isImportant} onChange={(event) => setForm({ ...form, isImportant: event.target.checked })} />
            设为重要任务
          </label>
          <button className="primary-button md:justify-self-end" type="submit">创建并加入待办</button>
        </form>
      ) : null}

      <div className="grid gap-4">
        {filtered.map((task) => <TaskCard key={task.id} task={task} onAddTodo={addTaskToTodos} />)}
      </div>
    </div>
  );
}
