import { Download, PlugZap, RefreshCcw, Save } from "lucide-react";
import { useState } from "react";
import { useAppData } from "../services/AppDataContext";
import { testImageApiConnection, testTextApiConnection } from "../services/aiService";
import { exportAllData } from "../services/storageService";

export function Settings() {
  const { profile, reviewSettings, updateProfile, updateReviewSettings, resetAllData } = useAppData();
  const [nickname, setNickname] = useState(profile.nickname);
  const [aiMode, setAiMode] = useState(profile.aiMode);
  const [theme, setTheme] = useState(profile.theme);
  const [aiPreferences, setAiPreferences] = useState(profile.aiPreferences);
  const [aiApiConfig, setAiApiConfig] = useState(profile.aiApiConfig);
  const [apiTestMessage, setApiTestMessage] = useState("");
  const [testingApi, setTestingApi] = useState<"text" | "image" | null>(null);

  function saveProfile() {
    updateProfile({ ...profile, nickname, aiMode, theme, aiPreferences, aiApiConfig });
    setApiTestMessage("AI 配置已保存。切换到 API 模式后，打卡和复盘会优先使用在线接口。");
  }

  async function testTextApi() {
    updateProfile({ ...profile, nickname, aiMode: "api", theme, aiPreferences, aiApiConfig });
    setTestingApi("text");
    setApiTestMessage("正在测试文本 API...");
    try {
      const result = await testTextApiConnection();
      setApiTestMessage(`文本 API 连接成功：${result}`);
    } catch (error) {
      setApiTestMessage(error instanceof Error ? error.message : "文本 API 测试失败。");
    } finally {
      setTestingApi(null);
    }
  }

  async function testImageApi() {
    updateProfile({ ...profile, nickname, aiMode: "api", theme, aiPreferences, aiApiConfig });
    setTestingApi("image");
    setApiTestMessage("正在测试生图 API...");
    try {
      await testImageApiConnection();
      setApiTestMessage("生图 API 连接成功，已经拿到图片返回。");
    } catch (error) {
      setApiTestMessage(error instanceof Error ? error.message : "生图 API 测试失败。");
    } finally {
      setTestingApi(null);
    }
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
        <h1 className="section-title mt-2">调整 LifeQuest 的陪伴方式</h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600">AI 偏好会影响人生卡文案、复盘总结和下一步建议的语气。</p>
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
              <option value="api">API 模式（优先使用在线配置）</option>
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
            保存设置
          </button>
        </div>

        <div className="glass-card space-y-5 p-6">
          <h2 className="text-lg font-black text-ink">AI 偏好</h2>
          <PreferenceSlider label="共情能力" hint="越高越温柔、越会回应情绪。" value={aiPreferences.empathy} onChange={(value) => setAiPreferences({ ...aiPreferences, empathy: value })} />
          <PreferenceSlider label="幽默能力" hint="越高越轻松俏皮，但不会油腻。" value={aiPreferences.humor} onChange={(value) => setAiPreferences({ ...aiPreferences, humor: value })} />
          <PreferenceSlider label="客观能力" hint="越高越直接、理性、少抒情。" value={aiPreferences.objectivity} onChange={(value) => setAiPreferences({ ...aiPreferences, objectivity: value })} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-black text-ink">复盘偏好</h2>
          <Toggle label="日复盘" checked={reviewSettings.daily} onChange={(checked) => updateReviewSettings({ ...reviewSettings, daily: checked })} />
          <Toggle label="周复盘" checked={reviewSettings.weekly} onChange={(checked) => updateReviewSettings({ ...reviewSettings, weekly: checked })} />
          <Toggle label="月复盘" checked={reviewSettings.monthly} onChange={(checked) => updateReviewSettings({ ...reviewSettings, monthly: checked })} />
          <Toggle label="季复盘" checked disabled />
          <Toggle label="年复盘" checked disabled />
        </div>
        <div className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-black text-ink">在线 AI API 配置</h2>
          <p className="text-sm leading-7 text-zinc-600">
            这里保存的是浏览器本地配置，适合在线演示时直接接入 OpenAI 兼容接口和高德地图逆地理服务。正式上线建议改成后端转发，避免 Key 暴露。
          </p>
          <div className="grid gap-3">
            <input
              className="soft-input"
              placeholder="文本 API Base，例如：https://api.openai.com/v1"
              value={aiApiConfig.textApiBase}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, textApiBase: event.target.value })}
            />
            <input
              className="soft-input"
              type="password"
              placeholder="文本 API Key"
              value={aiApiConfig.textApiKey}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, textApiKey: event.target.value })}
            />
            <input
              className="soft-input"
              placeholder="文本模型，例如：gpt-4o-mini"
              value={aiApiConfig.textModel}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, textModel: event.target.value })}
            />
            <input
              className="soft-input"
              placeholder="生图 API Base，例如：https://api.siliconflow.cn/v1"
              value={aiApiConfig.imageApiBase}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, imageApiBase: event.target.value })}
            />
            <input
              className="soft-input"
              type="password"
              placeholder="生图 API Key"
              value={aiApiConfig.imageApiKey}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, imageApiKey: event.target.value })}
            />
            <input
              className="soft-input"
              placeholder="生图模型，例如：gpt-image-1"
              value={aiApiConfig.imageModel}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, imageModel: event.target.value })}
            />
            <input
              className="soft-input"
              type="password"
              placeholder="高德地图 Web 服务 Key，用于把经纬度识别成地点名"
              value={aiApiConfig.amapApiKey}
              onChange={(event) => setAiApiConfig({ ...aiApiConfig, amapApiKey: event.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="primary-button" type="button" onClick={saveProfile}>
              <Save size={18} />
              保存 API 配置
            </button>
            <button className="secondary-button" type="button" onClick={testTextApi} disabled={testingApi !== null}>
              <PlugZap size={18} />
              {testingApi === "text" ? "测试中..." : "测试文本 API"}
            </button>
            <button className="secondary-button" type="button" onClick={testImageApi} disabled={testingApi !== null}>
              <PlugZap size={18} />
              {testingApi === "image" ? "测试中..." : "测试生图 API"}
            </button>
          </div>
          {apiTestMessage ? <p className="rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">{apiTestMessage}</p> : null}
          <pre className="overflow-x-auto rounded-2xl bg-ink p-4 text-xs leading-6 text-white">{`接口路径：
文本：{Base}/chat/completions
生图：{Base}/images/generations
地图：高德 Web 服务 /v3/geocode/regeo

.env 仍然可用，但在线配置会优先生效。Base 可以填根路径，系统会自动规整重复的完整接口路径。`}</pre>
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

function PreferenceSlider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block rounded-2xl bg-white/75 p-4">
      <span className="flex items-center justify-between gap-3">
        <span className="font-black text-ink">{label}</span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">{value}</span>
      </span>
      <input className="mt-3 w-full accent-orange-500" type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="mt-2 block text-xs text-zinc-500">{hint}</span>
    </label>
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
