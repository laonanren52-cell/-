import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Shuffle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { TaskCard } from "../components/TaskCard/TaskCard";
import { DotPattern } from "../components/ui/DotPattern";
import { SoftSearchBar } from "../components/ui/SoftSearchBar";
import { taskCategories } from "../data/presetTasks";
import { useAppData } from "../services/AppDataContext";
import { dismissTaskForToday, getTodayRecommendedTasks, refreshRecommendedTasks, replaceRecommendedTask } from "../services/recommendService";
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

  const categories = useMemo(() => Array.from(new Set(["全部", ...taskCategories.filter((item) => item !== "全部")])), []);

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const hitQuery = !query.trim() || task.title.includes(query.trim()) || task.description.includes(query.trim());
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
    <div className="page-shell space-y-8">
      <section className="relative overflow-hidden rounded-[40px] bg-[#FBFAF7] p-6 shadow-[0_16px_48px_rgba(30,30,30,0.06)] md:p-8">
        <DotPattern opacity={0.22} />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-[#A8B8AE]">人生任务库</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f1f1f] md:text-5xl">挑一件今天能完成的小支线</h1>
            <p className="mt-4 text-sm font-medium leading-7 text-[#626262]">
              保留左图右文的阅读节奏，先感受任务，再决定加入待办或直接打卡。
            </p>
          </div>
          <button type="button" className="primary-button" onClick={() => setShowForm((value) => !value)}>
            <Plus size={18} />
            创建待办来源
          </button>
        </div>
        <div className="relative z-10 mt-7 space-y-4">
          <SoftSearchBar value={query} onChange={setQuery} placeholder="搜索天空、独处、关系、成长..." />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                  category === item ? "bg-[#1f1f1f] text-white" : "bg-white text-[#626262] hover:text-[#1f1f1f]"
                }`}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[36px] bg-[#1f1f1f] p-5 text-white shadow-[0_16px_48px_rgba(30,30,30,0.12)] md:p-6">
        <DotPattern opacity={0.1} />
        <div className="relative z-10 mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-white/55">今日随机小支线</p>
            <h2 className="mt-1 text-2xl font-black">地球 Online 今日刷新</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68">每天保留 4 条任务，混合轻松、中等和挑战。不感兴趣的任务今天不再出现。</p>
          </div>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#1f1f1f]" onClick={refreshRecommendations}>
            <Shuffle size={18} />
            换一批
          </button>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recommendedTasks.map((task) => (
            <article key={task.id} className="rounded-[28px] bg-white/94 p-4 text-[#1f1f1f]">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F8F6F2] text-2xl">{task.icon || "·"}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-[#A8B8AE]">{task.category}</p>
                  <h3 className="mt-1 line-clamp-2 text-base font-black leading-6">{task.title}</h3>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[#626262]">{task.description}</p>
              <p className="mt-3 line-clamp-2 text-xs font-bold leading-5 text-[#626262]">
                <span className="text-[#1f1f1f]">解锁：{task.achievementName}</span>
                {task.unlockText ? ` · ${task.unlockText}` : ""}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link to={`/checkin/${task.id}`} className="primary-button px-3 py-2 text-xs">去打卡</Link>
                <button className="secondary-button px-3 py-2 text-xs" type="button" onClick={() => addTaskToTodos(task)}>待办</button>
                <button className="secondary-button px-3 py-2 text-xs" type="button" onClick={() => replaceRecommendation(task)}>
                  <RefreshCw size={14} />
                  换掉
                </button>
                <button className="secondary-button px-3 py-2 text-xs" type="button" onClick={() => dismissRecommendation(task)}>
                  <X size={14} />
                  不感兴趣
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showForm ? (
        <form className="paper-card grid grid-cols-1 gap-4 p-6 md:grid-cols-2" onSubmit={submitCustomTask}>
          <input className="soft-input" placeholder="任务名称" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <select className="soft-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.filter((item) => item !== "全部").map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="soft-input" placeholder="预计完成时间" value={form.suggestedDuration} onChange={(event) => setForm({ ...form, suggestedDuration: event.target.value })} />
          <select className="soft-input" value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })}>
            {difficulties.map((item) => <option key={item}>{item}</option>)}
          </select>
          <textarea className="soft-input min-h-28 md:col-span-2" placeholder="任务描述" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <label className="flex items-center gap-2 text-sm font-bold text-[#626262]">
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
