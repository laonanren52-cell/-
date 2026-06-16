import { Download, PlugZap, RefreshCcw, Save } from "lucide-react";
import { useState } from "react";
import { DotPattern } from "../components/ui/DotPattern";
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
  const [imageTestUrl, setImageTestUrl] = useState("");
  const [testingApi, setTestingApi] = useState<"text" | "image" | null>(null);

  const hasCompleteApiConfig = Boolean(
    (aiApiConfig.textApiBase && aiApiConfig.textApiKey && aiApiConfig.textModel) ||
    (aiApiConfig.imageApiBase && aiApiConfig.imageApiKey && aiApiConfig.imageModel),
  );

  function saveProfile() {
    const nextAiMode = hasCompleteApiConfig ? "api" : aiMode;
    setAiMode(nextAiMode);
    updateProfile({ ...profile, nickname, aiMode: nextAiMode, theme, aiPreferences, aiApiConfig });
    setApiTestMessage(
      nextAiMode === "api"
        ? "API 配置已保存，并已自动切换为 API 模式。"
        : "设置已保存。填写完整 API Base、Key、Model 后可启用在线 AI。",
    );
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
    setAiMode("api");
    setTestingApi("image");
    setImageTestUrl("");
    setApiTestMessage("正在测试生图 API...");
    try {
      const imageUrl = await testImageApiConnection();
      setImageTestUrl(imageUrl);
      setApiTestMessage("生图 API 连接成功，已展示测试图片。");
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
    <div className="page-shell space-y-7">
      <section className="paper-card relative overflow-hidden p-6 md:p-8">
        <DotPattern opacity={0.18} />
        <div className="relative z-10">
          <p className="text-sm font-black text-[#A8B8AE]">设置</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f1f1f] md:text-5xl">调整 LifeQuest 的陪伴方式</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[#626262]">AI 偏好会影响人生卡文案、时光映照和下一步建议的语气。</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="paper-card space-y-4 p-6">
          <h2 className="text-lg font-black text-[#1f1f1f]">个人偏好</h2>
          <label>
            <span className="mb-2 block text-sm font-bold text-[#626262]">昵称</span>
            <input className="soft-input" value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-[#626262]">AI 模式</span>
            <select className="soft-input" value={aiMode} onChange={(event) => setAiMode(event.target.value as "mock" | "api")}>
              <option value="mock">Mock 模式</option>
              <option value="api">API 模式</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-[#626262]">主题</span>
            <select className="soft-input" value={theme} onChange={(event) => setTheme(event.target.value as "warm" | "dark")}>
              <option value="warm">奶白纸感</option>
              <option value="dark">夜间深色（占位）</option>
            </select>
          </label>
          <button className="primary-button" onClick={saveProfile}>
            <Save size={18} />
            保存设置
          </button>
        </div>

        <div className="paper-card space-y-5 p-6">
          <h2 className="text-lg font-black text-[#1f1f1f]">AI 偏好</h2>
          <PreferenceSlider label="共情能力" hint="越高越温柔，越会回应情绪。" value={aiPreferences.empathy} onChange={(value) => setAiPreferences({ ...aiPreferences, empathy: value })} />
          <PreferenceSlider label="幽默能力" hint="越高越轻松俏皮，但不油腻。" value={aiPreferences.humor} onChange={(value) => setAiPreferences({ ...aiPreferences, humor: value })} />
          <PreferenceSlider label="客观能力" hint="越高越直接、理性、少抒情。" value={aiPreferences.objectivity} onChange={(value) => setAiPreferences({ ...aiPreferences, objectivity: value })} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="paper-card space-y-4 p-6">
          <h2 className="text-lg font-black text-[#1f1f1f]">时光映照偏好</h2>
          <Toggle label="日映照" checked={reviewSettings.daily} onChange={(checked) => updateReviewSettings({ ...reviewSettings, daily: checked })} />
          <Toggle label="周映照" checked={reviewSettings.weekly} onChange={(checked) => updateReviewSettings({ ...reviewSettings, weekly: checked })} />
          <Toggle label="月映照" checked={reviewSettings.monthly} onChange={(checked) => updateReviewSettings({ ...reviewSettings, monthly: checked })} />
          <Toggle label="季映照" checked disabled />
          <Toggle label="年映照" checked disabled />
        </div>

        <div className="paper-card space-y-4 p-6">
          <h2 className="text-lg font-black text-[#1f1f1f]">在线 AI API 配置</h2>
          <p className="text-sm font-medium leading-7 text-[#626262]">这里保存的是浏览器本地配置。正式上线建议改成后端转发，避免 Key 暴露。</p>
          <div className="grid gap-3">
            <input className="soft-input" placeholder="文本 API Base，例如：https://api.openai.com/v1" value={aiApiConfig.textApiBase} onChange={(event) => setAiApiConfig({ ...aiApiConfig, textApiBase: event.target.value })} />
            <input className="soft-input" type="password" placeholder="文本 API Key" value={aiApiConfig.textApiKey} onChange={(event) => setAiApiConfig({ ...aiApiConfig, textApiKey: event.target.value })} />
            <input className="soft-input" placeholder="文本模型，例如：gpt-4o-mini" value={aiApiConfig.textModel} onChange={(event) => setAiApiConfig({ ...aiApiConfig, textModel: event.target.value })} />
            <input className="soft-input" placeholder="生图 API Base" value={aiApiConfig.imageApiBase} onChange={(event) => setAiApiConfig({ ...aiApiConfig, imageApiBase: event.target.value })} />
            <input className="soft-input" type="password" placeholder="生图 API Key" value={aiApiConfig.imageApiKey} onChange={(event) => setAiApiConfig({ ...aiApiConfig, imageApiKey: event.target.value })} />
            <input className="soft-input" placeholder="生图模型，例如：gpt-image-1" value={aiApiConfig.imageModel} onChange={(event) => setAiApiConfig({ ...aiApiConfig, imageModel: event.target.value })} />
            <input className="soft-input" type="password" placeholder="高德地图 Web 服务 Key" value={aiApiConfig.amapApiKey} onChange={(event) => setAiApiConfig({ ...aiApiConfig, amapApiKey: event.target.value })} />
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
          {apiTestMessage ? <p className="rounded-[24px] bg-[#F8F6F2] p-4 text-sm font-medium leading-7 text-[#1f1f1f]">{apiTestMessage}</p> : null}
          {imageTestUrl ? <img src={imageTestUrl} alt="生图 API 测试结果" className="h-64 w-full rounded-[28px] object-cover" /> : null}
        </div>
      </section>

      <section className="paper-card flex flex-col gap-3 p-6 sm:flex-row">
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
    <label className="block rounded-[24px] bg-white/75 p-4">
      <span className="flex items-center justify-between gap-3">
        <span className="font-black text-[#1f1f1f]">{label}</span>
        <span className="rounded-full bg-[#F2F0EA] px-3 py-1 text-xs font-black text-[#626262]">{value}</span>
      </span>
      <input className="mt-3 w-full accent-[#A8B8AE]" type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <span className="mt-2 block text-xs font-medium text-[#626262]">{hint}</span>
    </label>
  );
}

function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange?: (checked: boolean) => void }) {
  return (
    <label className={`flex items-center justify-between rounded-[24px] bg-white/75 p-4 ${disabled ? "opacity-65" : ""}`}>
      <span>
        <span className="block text-sm font-black text-[#1f1f1f]">{label}</span>
        <span className="text-xs font-medium text-[#626262]">{disabled ? "系统固定保留，不能关闭" : "可自定义开启或关闭"}</span>
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} />
    </label>
  );
}
