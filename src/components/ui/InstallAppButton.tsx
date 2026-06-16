import { CheckCircle2, Info, MonitorDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type InstallAppButtonProps = {
  className?: string;
  variant?: "primary" | "ghost" | "card";
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = Boolean((window.navigator as NavigatorWithStandalone).standalone);
  return standaloneMedia || iosStandalone;
}

export function InstallAppButton({ className = "", variant = "primary" }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandaloneDisplay);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const updateStandaloneState = () => setInstalled(isStandaloneDisplay());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setMessage("");
    }

    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      setMessage("已安装到桌面。");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    mediaQuery.addEventListener("change", updateStandaloneState);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      mediaQuery.removeEventListener("change", updateStandaloneState);
    };
  }, []);

  const label = installed ? "已安装到桌面" : deferredPrompt ? "下载到桌面" : "浏览器菜单安装";
  const icon = installed ? <CheckCircle2 size={18} /> : <MonitorDown size={18} />;

  const buttonClass = useMemo(() => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#D8DEE5] disabled:cursor-default disabled:opacity-80";
    if (variant === "ghost") {
      return `${base} border border-[#E8E2D8] bg-white/70 px-4 py-2.5 text-[#25324A] shadow-[0_8px_22px_rgba(31,41,55,0.06)] hover:-translate-y-0.5 hover:bg-white`;
    }
    if (variant === "card") {
      return `${base} w-full bg-[#25324A] px-5 py-3 text-white shadow-[0_12px_30px_rgba(37,50,74,0.18)] hover:-translate-y-0.5 hover:bg-[#1F2937]`;
    }
    return `${base} bg-[#25324A] px-5 py-3 text-white shadow-[0_12px_30px_rgba(37,50,74,0.18)] hover:-translate-y-0.5 hover:bg-[#1F2937]`;
  }, [variant]);

  const messageClass =
    variant === "card"
      ? "mt-3 rounded-[22px] bg-white/75 p-4 text-sm font-medium leading-7 text-[#5F6368]"
      : "absolute right-0 top-[calc(100%+10px)] z-50 w-72 rounded-[22px] border border-[#E8E2D8] bg-white p-4 text-sm font-medium leading-7 text-[#5F6368] shadow-[0_18px_50px_rgba(31,41,55,0.12)]";

  async function handleInstallClick() {
    if (installed) {
      setMessage("回溯已经以桌面应用方式运行。");
      return;
    }

    if (!deferredPrompt) {
      setMessage("请使用 Chrome 或 Edge 浏览器，点击地址栏右侧安装图标，或在浏览器菜单中选择‘安装此应用’。");
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setMessage(choice.outcome === "accepted" ? "已安装到桌面。" : "已取消安装，你可以稍后再试。");
    if (choice.outcome === "accepted") setInstalled(true);
  }

  return (
    <div className={`relative inline-flex flex-col ${variant === "card" ? "w-full" : ""} ${className}`}>
      <button type="button" className={buttonClass} onClick={handleInstallClick} disabled={installed}>
        {icon}
        {label}
      </button>
      {message ? (
        <p className={messageClass} role="status">
          <Info className="mr-1 inline-block align-[-3px] text-[#25324A]" size={16} />
          {message}
        </p>
      ) : null}
    </div>
  );
}
