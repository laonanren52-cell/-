import { Download, RefreshCcw, Save } from "lucide-react";
import { useState } from "react";
import { useAppData } from "../services/AppDataContext";
import { exportAllData } from "../services/storageService";

export function Settings() {
  const { profile, reviewSettings, updateProfile, updateReviewSettings, resetAllData } = useAppData();
  const [nickname, setNickname] = useState(profile.nickname);
  const [aiMode, setAiMode] = useState(profile.aiMode);
  const [theme, setTheme] = useState(profile.theme);

  function saveProfile() {
    updateProfile({ ...profile, nickname, aiMode, theme });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lifequest-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-bold text-coral">设置</p>
        <h1 className="section-title mt-2">让 LifeQuest 更像你的生活方式</h1>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-black text-ink">个人偏好</h2>
          <label>
            <span className="mb-2 block text-sm font-bold text-zinc-600">昵称</span>
            <input className="soft-input" value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-zinc-600">AI 模式</span>
            <select className="soft-input" value={aiMode} onChange={(event) => setAiMode(event.target.value as "mock" | "api")}>
              <option value="mock">Mock 模式</option>
              <option value="api">API 模式（占位）</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-zinc-600">主题</span>
            <select className="soft-input" value={theme} onChange={(event) => setTheme(event.target.value as "warm" | "dark")}>
              <option value="warm">温暖浅色</option>
              <option value="dark">夜间深色（占位）</option>
            </select>
          </label>
          <button className="primary-button" onClick={saveProfile}>
            <Save size={18} />
            保存个人设置
          </button>
        </div>

        <div className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-black text-ink">复盘偏好</h2>
          <Toggle label="日复盘" checked={reviewSettings.daily} onChange={(checked) => updateReviewSettings({ ...reviewSettings, daily: checked })} />
          <Toggle label="周复盘" checked={reviewSettings.weekly} onChange={(checked) => updateReviewSettings({ ...reviewSettings, weekly: checked })} />
          <Toggle label="月复盘" checked={reviewSettings.monthly} onChange={(checked) => updateReviewSettings({ ...reviewSettings, monthly: checked })} />
          <Toggle label="季复盘" checked disabled />
          <Toggle label="年复盘" checked disabled />
        </div>
      </section>

      <section className="glass-card flex flex-col gap-3 p-6 sm:flex-row">
        <button className="secondary-button" onClick={exportJson}>
          <Download size={18} />
          导出 JSON
        </button>
        <button className="secondary-button text-rose-700" onClick={resetAllData}>
          <RefreshCcw size={18} />
          清空并恢复演示数据
        </button>
      </section>
    </div>
  );
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }) {
  return (
    <label className={`flex items-center justify-between rounded-2xl bg-white/75 p-4 ${disabled ? "opacity-65" : ""}`}>
      <span>
        <span className="block text-sm font-black text-ink">{label}</span>
        <span className="text-xs text-zinc-500">{disabled ? "系统固定保留，不能关闭" : "用户可自定义开启或关闭"}</span>
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} />
    </label>
  );
}
