import type { ReactNode } from "react";
import { ArrowRight, CalendarHeart, CheckCircle2, Clock3, ListChecks, PenLine, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { LifeCardPreview } from "../components/LifeCard/LifeCardPreview";
import { useAppData } from "../services/AppDataContext";
import { buildReviewStats, getCardsByPeriod, getPreviousPeriodCards, pickRepresentativeCards } from "../services/reviewService";
import { daysBetween, formatDate } from "../utils/date";

export function Dashboard() {
  const { profile, todos, lifeCards, anniversaries } = useAppData();
  const today = new Date().toISOString().slice(0, 10);
  const todayTodos = todos.filter((item) => item.date === today && item.status === "todo").slice(0, 5);
  const weekCards = getCardsByPeriod(lifeCards, "weekly");
  const previousWeekCards = getPreviousPeriodCards(lifeCards, "weekly");
  const weekStats = buildReviewStats(weekCards, previousWeekCards, "weekly");
  const recentCards = lifeCards
    .slice()
    .sort((a, b) => +new Date(b.completedAt || b.createdAt) - +new Date(a.completedAt || a.createdAt))
    .slice(0, 4);
  const representativeCard = pickRepresentativeCards(lifeCards)[0];
  const recentAnniversary = anniversaries
    .slice()
    .sort((a, b) => Math.abs(daysBetween(a.date)) - Math.abs(daysBetween(b.date)))[0];

  const encouragement = profile.aiPreferences.empathy > 70
    ? "今天不用把生活做得很满，认真完成一两件小事就已经很好。"
    : profile.aiPreferences.objectivity > 70
      ? "今天先选一件可执行的小任务，完成后及时记录。"
      : "给今天留一个小小的存档点吧。";

  return (
    <div className="page-shell space-y-7">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card overflow-hidden p-7">
          <p className="text-sm font-bold text-coral">{formatDate(new Date())}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
            {profile.nickname}，今天想给生活留下些什么？
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600">{encouragement}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/todos" className="primary-button">
              <ListChecks size={18} />
              看今日待办
            </Link>
            <Link to="/tasks" className="secondary-button">
              <Sparkles size={18} />
              快速去打卡
            </Link>
            <Link to="/diary?autoFocus=1" className="secondary-button">
              <PenLine size={18} />
              写小日记
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<ListChecks size={20} />} label="今日待办" value={todayTodos.length} />
          <StatCard icon={<CheckCircle2 size={20} />} label="本周打卡" value={weekCards.length} />
          <StatCard icon={<Sparkles size={20} />} label="累计人生卡" value={lifeCards.length} />
          <StatCard
            icon={<CalendarHeart size={20} />}
            label="最近节点"
            value={recentAnniversary ? `${Math.abs(daysBetween(recentAnniversary.date))}天` : "暂无"}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">今日重点</h2>
            <Link to="/todos" className="text-sm font-bold text-coral">新增待办</Link>
          </div>
          <div className="space-y-3">
            {todayTodos.length ? todayTodos.map((todo) => (
              <Link key={todo.id} to={todo.sourceTaskId ? `/checkin/${todo.sourceTaskId}` : "/todos"} className="flex items-center gap-3 rounded-2xl bg-white/75 p-4 transition hover:bg-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                  <Clock3 size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-black text-ink">{todo.title}</span>
                  <span className="line-clamp-1 text-sm text-zinc-500">{todo.description || "今天完成后可以转成人生卡。"}</span>
                </span>
                <ArrowRight className="ml-auto text-zinc-400" size={17} />
              </Link>
            )) : (
              <div className="rounded-2xl bg-white/75 p-6 text-sm leading-7 text-zinc-500">
                今天还没有待办。去任务库挑一个轻量支线，或者自己写一件想完成的小事。
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">复盘入口</h2>
            <Link to="/reviews?period=weekly" className="text-sm font-bold text-coral">查看轨迹</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["日复盘", "daily"],
              ["周复盘", "weekly"],
              ["月复盘", "monthly"],
              ["季复盘", "quarterly"],
              ["年复盘", "yearly"],
            ].map(([label, period]) => (
              <Link
                key={period}
                to={`/reviews?period=${period}`}
                className="rounded-2xl bg-white/80 p-4 text-center text-sm font-black text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                {label}
              </Link>
            ))}
          </div>

          {lifeCards.length ? (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl bg-orange-50 p-5">
                <div className="flex items-center gap-2 text-sm font-black text-orange-900">
                  <TrendingUp size={18} />
                  本周迷你复盘
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniMetric label="本周完成" value={`${weekStats.totalCards} 张`} />
                  <MiniMetric label="较上周" value={weekStats.growthRate > 0 ? `+${weekStats.growthRate}` : String(weekStats.growthRate)} />
                  <MiniMetric label="高频分类" value={weekStats.topCategory} wide />
                </div>
              </div>
              <div className="min-w-0">
                {representativeCard ? (
                  <LifeCardPreview card={representativeCard} compact />
                ) : (
                  <div className="rounded-2xl bg-white/75 p-5 text-sm leading-7 text-zinc-500">最近代表卡会出现在这里。</div>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">
              完成一次打卡后，这里会生成你的生活复盘。
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">最近完成</h2>
          <Link to="/timeline" className="text-sm font-bold text-coral">查看人生轨迹</Link>
        </div>
        <div className="grid auto-rows-auto grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recentCards.map((card) => <LifeCardPreview key={card.id} card={card} compact />)}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">{icon}</div>
      <p className="text-xs font-bold text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-white/80 p-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs font-bold text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-ink">{value}</p>
    </div>
  );
}
