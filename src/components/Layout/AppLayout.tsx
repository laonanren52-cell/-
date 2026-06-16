import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, CalendarHeart, CheckCircle2, Compass, Home, ListChecks, Settings } from "lucide-react";
import { InstallAppButton } from "../ui/InstallAppButton";
import { PwaUpdatePrompt } from "../ui/PwaUpdatePrompt";
import { RecallLogo } from "../ui/RecallLogo";
import { useAppData } from "../../services/AppDataContext";

const navItems = [
  { to: "/", label: "首页", icon: Home },
  { to: "/tasks", label: "任务库", icon: Compass },
  { to: "/todos", label: "待办", icon: ListChecks },
  { to: "/anniversaries", label: "纪念日", icon: CalendarHeart },
  { to: "/reviews", label: "回溯", icon: BookOpen },
  { to: "/settings", label: "设置", icon: Settings },
];

export function AppLayout() {
  const { lifeCards } = useAppData();
  const mobileItems = navItems.slice(0, 5);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F6F2] text-[#1f1f1f]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#F8F6F2]/86 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="group flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_12px_32px_rgba(37,50,74,0.12)] transition duration-500 group-hover:scale-105">
              <RecallLogo size={36} animated variant="dark" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-normal text-[#25324A]">回溯</p>
              <p className="truncate text-xs font-medium text-[#6B7280]">人生记录模拟器 · 已收藏 {lifeCards.length} 个片段</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/55 p-1 shadow-[inset_0_1px_6px_rgba(31,31,31,0.04)] lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive ? "bg-[#1f1f1f] text-white shadow-sm" : "text-[#626262] hover:bg-white hover:text-[#1f1f1f]"
                  }`
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <InstallAppButton variant="ghost" className="hidden xl:inline-flex" />
            <NavLink to="/tasks" className="primary-button">
              <CheckCircle2 size={18} />
              去打卡
            </NavLink>
          </div>
        </div>
      </header>

      <main className="w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-full border border-white/90 bg-white/90 p-2 shadow-[0_18px_48px_rgba(30,30,30,0.14)] backdrop-blur-2xl lg:hidden">
        {mobileItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-bold transition ${
                isActive ? "bg-[#1f1f1f] text-white" : "text-[#626262]"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <PwaUpdatePrompt />
      <div className="h-24 lg:hidden" />
    </div>
  );
}
