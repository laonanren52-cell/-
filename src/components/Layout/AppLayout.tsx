import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, CalendarHeart, CheckCircle2, Compass, Home, ListChecks, PenLine, Settings, Sparkles, TimerReset } from "lucide-react";
import { useAppData } from "../../services/AppDataContext";

const navItems = [
  { to: "/", label: "进度盘", icon: Home },
  { to: "/tasks", label: "任务库", icon: Compass },
  { to: "/todos", label: "待办", icon: ListChecks },
  { to: "/diary", label: "日记", icon: PenLine },
  { to: "/timeline", label: "轨迹", icon: TimerReset },
  { to: "/reviews", label: "复盘", icon: BookOpen },
  { to: "/anniversaries", label: "纪念日", icon: CalendarHeart },
  { to: "/settings", label: "设置", icon: Settings },
];

export function AppLayout() {
  const { profile, lifeCards } = useAppData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffd9df_0,#fff8ed_30%,#f7fbff_70%)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-white shadow-glow">
              <Sparkles size={22} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-ink">人生支线 LifeQuest</p>
              <p className="truncate text-xs text-zinc-500">Hi，{profile.nickname}，已经收藏 {lifeCards.length} 个生活证据</p>
            </div>
          </NavLink>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-ink text-white shadow-sm" : "text-zinc-600 hover:bg-white/80 hover:text-ink"
                  }`
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <NavLink to="/tasks" className="primary-button hidden sm:inline-flex">
            <CheckCircle2 size={18} />
            去打卡
          </NavLink>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-3xl border border-white/80 bg-white/90 p-2 shadow-glow backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                isActive ? "bg-ink text-white" : "text-zinc-500"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="h-24 lg:hidden" />
    </div>
  );
}
