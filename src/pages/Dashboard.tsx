import { useMemo, useState } from "react";
import { BookOpen, CalendarHeart, CheckCircle2, Clock3, ListChecks, NotebookPen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { LifeCardPreview } from "../components/LifeCard/LifeCardPreview";
import { DotPattern } from "../components/ui/DotPattern";
import { HomeEntryTile } from "../components/ui/HomeEntryTile";
import { InstallAppButton } from "../components/ui/InstallAppButton";
import { RecallLogo } from "../components/ui/RecallLogo";
import { SoftSearchBar } from "../components/ui/SoftSearchBar";
import { useAppData } from "../services/AppDataContext";
import { buildReviewStats, getCardsByPeriod, getPreviousPeriodCards, pickRepresentativeCards } from "../services/reviewService";
import { daysBetween, formatDate } from "../utils/date";

export function Dashboard() {
  const { profile, todos, tasks, lifeCards, anniversaries } = useAppData();
  const [query, setQuery] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const todayTodos = todos.filter((item) => item.date === today && item.status === "todo").slice(0, 4);
  const weekCards = getCardsByPeriod(lifeCards, "weekly");
  const previousWeekCards = getPreviousPeriodCards(lifeCards, "weekly");
  const weekStats = buildReviewStats(weekCards, previousWeekCards, "weekly");
  const recentCards = pickRepresentativeCards(lifeCards).slice(0, 2);
  const recentAnniversary = anniversaries
    .slice()
    .sort((a, b) => Math.abs(daysBetween(a.date)) - Math.abs(daysBetween(b.date)))[0];

  const searchResults = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return [];
    const taskHits = tasks
      .filter((task) => task.title.includes(keyword) || task.description.includes(keyword))
      .slice(0, 3)
      .map((item) => ({ id: item.id, title: item.title, type: "任务", to: `/checkin/${item.id}` }));
    const cardHits = lifeCards
      .filter((card) => card.title.includes(keyword) || card.note?.includes(keyword) || card.aiGeneratedText?.includes(keyword))
      .slice(0, 3)
      .map((item) => ({ id: item.id, title: item.title, type: "人生卡", to: `/cards/${item.id}` }));
    const anniversaryHits = anniversaries
      .filter((item) => item.title.includes(keyword) || item.description.includes(keyword))
      .slice(0, 2)
      .map((item) => ({ id: item.id, title: item.title, type: "纪念日", to: "/anniversaries" }));
    return [...taskHits, ...cardHits, ...anniversaryHits].slice(0, 6);
  }, [anniversaries, lifeCards, query, tasks]);

  return (
    <div className="page-shell pb-8">
      <section className="relative mx-auto max-w-5xl pt-2 animate-fade-up">
        <SoftSearchBar value={query} onChange={setQuery} />
        {query.trim() ? (
          <div className="absolute inset-x-0 top-[76px] z-30 rounded-[28px] border border-white/80 bg-white/95 p-3 shadow-[0_18px_48px_rgba(30,30,30,0.12)] backdrop-blur">
            {searchResults.length ? searchResults.map((item) => (
              <Link key={`${item.type}-${item.id}`} to={item.to} className="flex items-center justify-between rounded-[20px] px-4 py-3 text-sm font-bold text-[#1f1f1f] transition hover:bg-[#F8F6F2]">
                <span className="truncate">{item.title}</span>
                <span className="ml-3 shrink-0 rounded-full bg-[#F8F6F2] px-3 py-1 text-xs text-[#626262]">{item.type}</span>
              </Link>
            )) : (
              <p className="px-4 py-5 text-sm font-medium text-[#626262]">暂时没有找到匹配内容。</p>
            )}
          </div>
        ) : null}
      </section>

      <section className="relative mt-10 overflow-hidden rounded-[40px] bg-[#FBFAF7] px-6 py-12 text-center shadow-[0_16px_48px_rgba(30,30,30,0.06)] md:px-12 md:py-16 animate-fade-up">
        <DotPattern opacity={0.24} className="animate-float-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(168,184,174,0.18),transparent_34%),radial-gradient(circle_at_20%_82%,rgba(232,182,139,0.10),transparent_32%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_14px_36px_rgba(37,50,74,0.10)] animate-float-slow">
            <RecallLogo size={48} animated variant="soft" />
          </div>
          <p className="mt-6 text-sm font-black text-[#9AA6B8]">{formatDate(new Date())}</p>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-normal text-[#1f1f1f] md:text-7xl">人生打卡</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-[#6B7280]">
            {profile.nickname}，把今天值得记住的小事完成、记录、存档；回溯会在之后帮你看见自己走过的路。
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/tasks" className="primary-button">去打卡</Link>
            <Link to="/tasks" className="secondary-button">查看任务库</Link>
            <InstallAppButton variant="ghost" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl animate-fade-up">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <HomeEntryTile title="纪念日" subtitle={recentAnniversary ? `最近节点：${Math.abs(daysBetween(recentAnniversary.date))} 天` : "保存值得记住的日子"} icon={CalendarHeart} to="/anniversaries" />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <HomeEntryTile title="待办事项" subtitle={`${todayTodos.length} 件今天想完成的小支线`} icon={ListChecks} to="/todos" />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <HomeEntryTile title="小日记" subtitle="给生活片段补一段真实感受" icon={NotebookPen} to="/diary" />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
            <HomeEntryTile title="回溯" subtitle={`本周保存 ${weekStats.totalCards} 张人生卡`} icon={BookOpen} to="/reviews?period=weekly" />
          </div>
        </div>
      </section>

      <section className="mt-16 space-y-5 animate-fade-up md:mt-20">
        <div className="flex items-center gap-4">
          <h2 className="shrink-0 text-3xl font-bold text-[#1F1F1F]">我的待办</h2>
          <div className="h-px flex-1 bg-[#D8DEE5]" />
          <Link to="/todos" className="text-sm font-black text-[#626262]">管理</Link>
        </div>
        <div className="grid gap-3">
          {todayTodos.length ? todayTodos.map((todo) => (
            <Link key={todo.id} to={todo.sourceTaskId ? `/checkin/${todo.sourceTaskId}` : "/todos"} className="group flex items-center gap-4 rounded-[28px] border border-white/80 bg-[#FBFAF7] p-4 shadow-[0_10px_32px_rgba(30,30,30,0.05)] transition hover:-translate-y-0.5 hover:bg-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#25324A] shadow-[inset_0_1px_8px_rgba(31,31,31,0.05)]">
                <Clock3 size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-black text-[#1f1f1f]">{todo.title}</span>
                <span className="line-clamp-1 text-sm font-medium text-[#626262]">{todo.description || "完成后可以转成人生卡。"}</span>
              </span>
              <CheckCircle2 className="text-[#A8B8AE] transition group-hover:scale-110" size={20} />
            </Link>
          )) : (
            <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[#FBFAF7] p-7 shadow-[0_12px_40px_rgba(30,30,30,0.06)]">
              <DotPattern opacity={0.22} />
              <div className="relative z-10">
                <p className="text-lg font-black text-[#1f1f1f]">今天还没有待办</p>
                <p className="mt-2 text-sm font-medium leading-7 text-[#626262]">去任务库接一条小支线吧。</p>
                <Link to="/tasks" className="secondary-button mt-5">去任务库</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[#FBFAF7] p-6 text-[#1f1f1f] shadow-[0_12px_40px_rgba(30,30,30,0.06)] animate-soft-scale">
          <DotPattern opacity={0.2} />
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#25324A] shadow-[inset_0_1px_8px_rgba(31,31,31,0.05)]">
              <Sparkles size={20} />
            </div>
            <p className="mt-8 text-sm font-black text-[#9AA6B8]">回溯摘要</p>
            <p className="mt-2 text-4xl font-black">{weekStats.totalCards} 张</p>
            <p className="mt-3 text-sm font-medium leading-7 text-[#626262]">高频分类：{weekStats.topCategory}。常见情绪：{weekStats.topMood}。</p>
            <Link to="/reviews?period=weekly" className="primary-button mt-6">进入回溯</Link>
          </div>
        </div>

        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-4">
            <h2 className="shrink-0 text-2xl font-black text-[#1f1f1f]">最近人生卡</h2>
            <span className="h-px flex-1 bg-[#D8DEE5]" />
          </div>
          {recentCards.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentCards.map((card) => <LifeCardPreview key={card.id} card={card} compact />)}
            </div>
          ) : (
            <div className="paper-card p-6 text-sm font-medium leading-7 text-[#626262]">完成一次打卡后，最近的人生卡会安静地出现在这里。</div>
          )}
        </div>
      </section>
    </div>
  );
}
