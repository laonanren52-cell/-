import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Edit3, Pin, Plus, Trash2 } from "lucide-react";
import { DotPattern } from "../components/ui/DotPattern";
import { useAppData } from "../services/AppDataContext";

export function Todos() {
  const { todos, tasks, createTodo, updateTodo, completeTodo, removeTodo, toggleTodoPin } = useAppData();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const dayTodos = useMemo(
    () => todos.filter((item) => item.date === date).sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.createdAt) - +new Date(a.createdAt)),
    [date, todos],
  );
  const active = dayTodos.filter((item) => item.status === "todo");
  const completed = dayTodos.filter((item) => item.status === "completed");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      const old = todos.find((item) => item.id === editingId);
      if (old) updateTodo({ ...old, title: form.title, description: form.description, date });
      setEditingId(null);
    } else {
      createTodo({ title: form.title, description: form.description, date });
    }
    setForm({ title: "", description: "" });
  }

  function startEdit(id: string) {
    const item = todos.find((todo) => todo.id === id);
    if (!item) return;
    setEditingId(id);
    setForm({ title: item.title, description: item.description ?? "" });
    setDate(item.date);
  }

  function getCheckInTarget(todoTitle: string, sourceTaskId?: string) {
    const task = sourceTaskId ? tasks.find((item) => item.id === sourceTaskId) : tasks.find((item) => item.title === todoTitle);
    return task ? `/checkin/${task.id}` : "/tasks";
  }

  return (
    <div className="page-shell space-y-7">
      <section className="relative overflow-hidden rounded-[40px] bg-[#FBFAF7] p-6 shadow-[0_16px_48px_rgba(30,30,30,0.06)] md:p-8 animate-fade-up">
        <DotPattern opacity={0.2} />
        <div className="relative z-10">
          <p className="text-sm font-black text-[#A8B8AE]">待办事项</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f1f1f] md:text-5xl">把今天想完成的小支线先放在这里。</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[#626262]">完成后可以一键转入正式打卡流程，变成一张人生卡。</p>
          <div className="mt-6 grid gap-3 md:grid-cols-[220px_1fr]">
            <input className="soft-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <div className="rounded-[24px] bg-white/80 p-4 text-sm font-black text-[#626262]">
              待完成 {active.length} 条，已完成 {completed.length} 条
            </div>
          </div>
        </div>
      </section>

      <form className="paper-card grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_1.2fr_auto] animate-fade-up" onSubmit={submit}>
        <input className="soft-input" placeholder="新增待办，例如：拍一张今天的天空" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <input className="soft-input" placeholder="补充描述，可选" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <button className="primary-button" type="submit">
          <Plus size={18} />
          {editingId ? "保存" : "新增"}
        </button>
      </form>

      <TodoSection title="待完成" items={active} onDone={completeTodo} onRemove={removeTodo} onPin={toggleTodoPin} onEdit={startEdit} getTarget={getCheckInTarget} />
      <TodoSection title="今日完成" items={completed} onDone={completeTodo} onRemove={removeTodo} onPin={toggleTodoPin} onEdit={startEdit} getTarget={getCheckInTarget} completed />
    </div>
  );
}

type TodoSectionProps = {
  title: string;
  items: ReturnType<typeof useAppData>["todos"];
  completed?: boolean;
  onDone: (id: string) => void;
  onRemove: (id: string) => void;
  onPin: (id: string) => void;
  onEdit: (id: string) => void;
  getTarget: (title: string, sourceTaskId?: string) => string;
};

function TodoSection({ title, items, completed, onDone, onRemove, onPin, onEdit, getTarget }: TodoSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="shrink-0 text-2xl font-black text-[#1f1f1f]">{title}</h2>
        <span className="h-px flex-1 bg-[#D8DEE5]" />
      </div>
      <div className="grid gap-3">
        {items.length ? items.map((item) => (
          <article key={item.id} className="paper-card p-5 transition hover:-translate-y-0.5 hover:bg-white animate-fade-up">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  {item.category ? <span className="rounded-full bg-[#F2F0EA] px-3 py-1 text-xs font-black text-[#626262]">{item.category}</span> : null}
                  {item.isPinned ? <span className="rounded-full bg-[#1f1f1f] px-3 py-1 text-xs font-black text-white">置顶</span> : null}
                </div>
                <h3 className={`text-xl font-black ${completed ? "text-[#8b8b86] line-through" : "text-[#1f1f1f]"}`}>{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-7 text-[#626262]">{item.description || "完成后可以转成一张人生卡。"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!completed ? (
                  <button className="secondary-button px-3 py-2" onClick={() => onDone(item.id)} type="button">
                    <CheckCircle2 size={17} />
                    标记完成
                  </button>
                ) : null}
                <Link className="primary-button px-3 py-2" to={getTarget(item.title, item.sourceTaskId)}>
                  完成打卡
                </Link>
                <button className="icon-button" type="button" title="置顶" onClick={() => onPin(item.id)}><Pin size={17} /></button>
                <button className="icon-button" type="button" title="编辑" onClick={() => onEdit(item.id)}><Edit3 size={17} /></button>
                <button className="icon-button" type="button" title="删除" onClick={() => onRemove(item.id)}><Trash2 size={17} /></button>
              </div>
            </div>
          </article>
        )) : (
          <div className="paper-card p-7 text-sm font-medium text-[#626262]">这里暂时没有事项。</div>
        )}
      </div>
    </section>
  );
}
