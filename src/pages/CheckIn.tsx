import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, LocateFixed, Loader2, Sparkles } from "lucide-react";
import { MoodPill, moodExamples } from "../components/MoodTag/MoodTag";
import { useAppData } from "../services/AppDataContext";
import { reverseGeocodeWithAmap } from "../services/reverseGeocodeService";
import { toInputDateTime } from "../utils/date";
import { fileToCompressedBase64 } from "../utils/image";

export function CheckIn() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { profile, tasks, createLifeCard } = useAppData();
  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);
  const [completedAt, setCompletedAt] = useState(toInputDateTime());
  const [location, setLocation] = useState("");
  const [locationName, setLocationName] = useState<string | undefined>();
  const [locationAddress, setLocationAddress] = useState<string | undefined>();
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [geoMessage, setGeoMessage] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [moodText, setMoodText] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageMessage, setImageMessage] = useState("");
  const [isAnniversary, setIsAnniversary] = useState(false);
  const [shouldGenerateImage, setShouldGenerateImage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [mockModeWarning, setMockModeWarning] = useState(false);

  if (!task) {
    return <div className="page-shell"><div className="glass-card p-8">没有找到这条任务。</div></div>;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await submitCard(false);
  }

  async function submitCard(allowMockFallback: boolean) {
    if (!imageUrl && shouldGenerateImage && profile.aiMode !== "api" && !allowMockFallback) {
      setMockModeWarning(true);
      setSubmitMessage("当前仍是 Mock 模式，不会调用真实生图接口。请到设置页切换 API 模式。");
      return;
    }
    setMockModeWarning(false);
    setSubmitting(true);
    setSubmitMessage(
      !imageUrl && shouldGenerateImage
        ? "正在生成这张人生卡的纪念图..."
        : "正在保存这张人生卡...",
    );
    try {
      const manualLocation = location.trim();
      const card = await createLifeCard({
        task: task!,
        completedAt,
        location: manualLocation || locationName,
        locationName: locationName || manualLocation || undefined,
        locationAddress,
        latitude,
        longitude,
        moodText: moodText.trim() || "平静",
        note: note.trim() || `我完成了「${task!.title}」，想把这一刻记录下来。`,
        uploadedImageUrl: imageUrl,
        isAnniversary,
        shouldGenerateImage: !imageUrl && shouldGenerateImage,
      });
      if (card.aiImageError) {
        setSubmitMessage(card.aiImageError);
        window.setTimeout(() => navigate(`/cards/${card.id}`), 900);
      } else {
        navigate(`/cards/${card.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageMessage("正在压缩照片...");
    try {
      const compressed = await fileToCompressedBase64(file);
      setImageUrl(compressed);
      setShouldGenerateImage(false);
      setImageMessage("照片已压缩并保存为本地预览，生成人生卡时会优先使用这张照片。");
    } catch {
      setImageMessage("照片处理失败，请换一张图片再试。");
    }
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setGeoMessage("当前浏览器不支持定位，你仍然可以手动填写地点。");
      return;
    }
    setGeoLoading(true);
    setGeoMessage("正在识别当前位置...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        try {
          const result = await reverseGeocodeWithAmap({
            latitude: lat,
            longitude: lng,
            amapApiKey: profile.aiApiConfig.amapApiKey,
          });
          setLocationName(result.locationName);
          setLocationAddress(result.locationAddress);
          setLocation(result.locationName || "");
          setGeoMessage(result.locationAddress ? `已识别地点：${result.locationName}，${result.locationAddress}` : `已识别地点：${result.locationName}`);
        } catch (error) {
          setLocationName(undefined);
          setLocationAddress(undefined);
          setGeoMessage(error instanceof Error ? error.message : "已获取定位，但暂时无法识别地点名称。");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoMessage("没有拿到定位权限。没关系，你可以手动写一个地点。");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="page-shell">
      <form className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]" onSubmit={submit}>
        <section className="glass-card p-6">
          <p className="text-sm font-bold text-coral">完成打卡</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{task.title}</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">{task.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{task.category}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500">{task.difficulty}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500">{task.suggestedDuration}</span>
          </div>

          <div className="mt-8 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-bold text-zinc-600">完成时间</span>
              <input className="soft-input" type="datetime-local" value={completedAt} onChange={(event) => setCompletedAt(event.target.value)} />
            </label>
            <div>
              <span className="mb-2 block text-sm font-bold text-zinc-600">地点</span>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="soft-input"
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    setLocationName(event.target.value || undefined);
                    setLocationAddress(undefined);
                  }}
                  placeholder="比如：苏州大学、学校附近的小火锅店"
                />
                <button className="secondary-button" type="button" onClick={getLocation} disabled={geoLoading}>
                  {geoLoading ? <Loader2 className="animate-spin" size={18} /> : <LocateFixed size={18} />}
                  {geoLoading ? "正在识别当前位置" : "获取当前位置"}
                </button>
              </div>
              {geoMessage ? <p className="mt-2 text-xs font-semibold text-zinc-500">{geoMessage}</p> : null}
            </div>
            <div>
              <span className="mb-2 block text-sm font-bold text-zinc-600">今日情绪</span>
              <input className="soft-input" value={moodText} onChange={(event) => setMoodText(event.target.value)} placeholder="例如：有点孤单但轻松" />
              <div className="mt-2 flex flex-wrap gap-2">
                {moodExamples.map((item) => <MoodPill key={item} text={item} onClick={() => setMoodText(item)} selected={moodText === item} />)}
              </div>
            </div>
            <label>
              <span className="mb-2 block text-sm font-bold text-zinc-600">真实感受</span>
              <textarea
                className="soft-input min-h-40"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="写具体一点：发生了什么、你当时怎么想、情绪有没有变化。AI 会围绕这些内容生成纪念文案。"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="secondary-button cursor-pointer">
                <Camera size={18} />
                上传照片
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              <label className="secondary-button cursor-pointer justify-start">
                <input type="checkbox" checked={isAnniversary} onChange={(event) => setIsAnniversary(event.target.checked)} />
                设为纪念日
              </label>
              <label className="secondary-button cursor-pointer justify-start sm:col-span-2">
                <input type="checkbox" checked={shouldGenerateImage} disabled={Boolean(imageUrl)} onChange={(event) => setShouldGenerateImage(event.target.checked)} />
                {imageUrl ? "已上传照片，将优先使用用户图片" : "未上传照片时生成 AI 纪念图"}
              </label>
            </div>
            {imageMessage ? <p className="text-xs font-semibold text-zinc-500">{imageMessage}</p> : null}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="glass-card overflow-hidden">
            <div className="relative min-h-80 bg-gradient-to-br from-blush via-cream to-skysoft p-6">
              {imageUrl ? <img src={imageUrl} alt="本地预览" className="absolute inset-0 h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-white/35" />
              <div className="relative flex h-full flex-col justify-between gap-28">
                <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-ink">{imageUrl ? "用户上传照片" : shouldGenerateImage ? "AI 纪念图将生成" : "默认记录卡"}</span>
                <div>
                  <h2 className="text-2xl font-black text-ink">{task.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-700">{note || "完成后，AI 会基于任务、感受和今日情绪生成更具体的纪念文案。"}</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <button className="primary-button w-full" type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {submitting ? (!imageUrl && shouldGenerateImage ? "正在生成纪念图..." : "正在保存...") : "生成我的人生卡"}
              </button>
              {submitMessage ? <p className="mt-3 text-xs font-semibold leading-6 text-zinc-500">{submitMessage}</p> : null}
              {mockModeWarning ? (
                <div className="mt-3 grid gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-bold">当前仍是 Mock 模式，不会调用真实生图接口。</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="secondary-button bg-white" type="button" onClick={() => submitCard(true)}>
                      继续保存默认卡片
                    </button>
                    <button className="secondary-button bg-white" type="button" onClick={() => navigate("/settings")}>
                      去设置页开启 API 模式
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
