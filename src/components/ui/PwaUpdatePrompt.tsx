import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
    setUpdateServiceWorker(() => update);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-md rounded-[28px] border border-[#E8E2D8] bg-white/95 p-4 shadow-[0_18px_60px_rgba(31,41,55,0.16)] backdrop-blur lg:bottom-6 lg:right-6 lg:left-auto">
      <p className="text-sm font-black text-[#1F1F1F]">发现新版本，刷新后体验最新功能。</p>
      <button className="primary-button mt-3 w-full" type="button" onClick={() => updateServiceWorker?.(true)}>
        <RefreshCcw size={18} />
        立即刷新
      </button>
    </div>
  );
}
