import type { ReactNode } from "react";
import { ArrowRight, CalendarHeart, CheckCircle2, HeartHandshake, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "../services/AppDataContext";
import { LifeCardPreview } from "../components/LifeCard/LifeCardPreview";
import { daysBetween, formatDate } from "../utils/date";

export function Dashboard() {
  const { profile, tasks, wishlist, lifeCards, anniversaries } = useAppData();
  const month = new Date().getMonth();
  const monthCards = lifeCards.filter((card) => new Date(card.completedAt).getMonth() === month);
  const activeWishlist = wishlist.filter((item) => item.status !== "已完成");
  const recentAnniversary = anniversaries
    .slice()
    .sort((a, b) => Math.abs(daysBetween(a.date)) - Math.abs(daysBetween(b.date)))[0];
  const recommendation = tasks.find((task) => task.status === "preset") ?? tasks[0];
  const recentCards = lifeCards.slice().sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt)).slice(0, 3);

  return (
    <div className="page-shell space-y-8">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white shadow-glow sm:p-9">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-coral/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-skysoft/30 blur-3xl" />
          <div className="relative">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">今天也可以开启一条很小的支线</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              {profile.nickname}，把生活里的尝试，收成一张张人生卡。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              LifeQuest 会帮你从第一次、关系、独处、成长和治愈里找到下一步，并把完成后的感受沉淀成纪念卡与复盘轨迹。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={`/checkin/${recommendation?.id}`} className="primary-button bg-white text-ink hover:bg-orange-50">
                <CheckCircle2 size={18} />
                去打卡
              </Link>
              <Link to="/tasks" className="secondary-button border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Plus size={18} />
                创建愿望
              </Link>
              <Link to="/reviews" className="secondary-button border-white/20 bg-white/10 text-white hover:bg-white/20">
                查看复盘
              </Link>
              <Link to="/anniversaries" className="secondary-button border-white/20 bg-white/10 text-white hover:bg-white/20">
                查看纪念日
              </Link>
            </div>
          </div>
        </div>
        <aside className="glass-card p-6">
          <p className="text-sm font-bold text-zinc-400">今日推荐人生任务</p>
          <h2 className="mt-3 text-2xl font-black text-ink">{recommendation?.title}</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600">{recommendation?.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-zinc-500">
            <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">{recommendation?.category}</span>
            <span className="rounded-full bg-white px-3 py-1">{recommendation?.difficulty}</span>
            <span className="rounded-full bg-white px-3 py-1">{recommendation?.suggestedDuration}</span>
          </div>
          <Link to={`/checkin/${recommendation?.id}`} className="primary-button mt-6 w-full">
            开始这条支线
            <ArrowRight size={17} />
          </Link>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Sparkles size={22} />} label="已完成人生卡" value={lifeCards.length} hint="每一张都是生活证据" />
        <StatCard icon={<HeartHandshake size={22} />} label="进行中的愿望" value={activeWishlist.length} hint="Bucket List 正在生长" />
        <StatCard icon={<CheckCircle2 size={22} />} label="本月完成任务" value={monthCards.length} hint="这个月也有新坐标" />
        <StatCard
          icon={<CalendarHeart size={22} />}
          label="最近纪念日"
          value={recentAnniversary ? `${Math.abs(daysBetween(recentAnniversary.date))} 天` : "暂无"}
          hint={recentAnniversary ? `${recentAnniversary.title} · ${formatDate(recentAnniversary.date)}` : "完成重要打卡后自动出现"}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">最近完成的人生卡</h2>
          <Link to="/timeline" className="text-sm font-bold text-coral">
            查看轨迹
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recentCards.map((card) => (
            <LifeCardPreview key={card.id} card={card} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: number | string; hint: string }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">{icon}</div>
      <p className="text-sm font-bold text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{hint}</p>
    </div>
  );
}
