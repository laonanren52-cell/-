import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Sparkles } from "lucide-react";
import { MoodTag, moodOptions } from "../components/MoodTag/MoodTag";
import { useAppData } from "../services/AppDataContext";
import type { MoodTag as MoodTagType } from "../types";
import { toInputDateTime } from "../utils/date";

export function CheckIn() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, createLifeCard } = useAppData();
  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);
  const [completedAt, setCompletedAt] = useState(toInputDateTime());
  const [location, setLocation] = useState("");
  const [moods, setMoods] = useState<MoodTagType[]>(["平静"]);
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isAnniversary, setIsAnniversary] = useState(false);
  const [shouldGenerateImage, setShouldGenerateImage] = useState(true);

  if (!task) {
    return <div className="page-shell"><div className="glass-card p-8">没有找到这条任务。</div></div>;
  }

  function toggleMood(mood: MoodTagType) {
    setMoods((current) => (current.includes(mood) ? current.filter((item) => item !== mood) : [...current, mood]));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const card = createLifeCard({
      task: task!,
      completedAt,
      location,
      moodTags: moods.length ? moods : ["平静"],
      note: note.trim() || "这一次，我认真完成了这条人生支线。",
      imageUrl,
      isAnniversary,
      shouldGenerateImage,
    });
    navigate(`/cards/${card.id}`);
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
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
            <label>
              <span className="mb-2 block text-sm font-bold text-zinc-600">地点</span>
              <input className="soft-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="比如：学校附近的小火锅店" />
            </label>
            <div>
              <span className="mb-2 block text-sm font-bold text-zinc-600">心情标签</span>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <MoodTag key={mood} mood={mood} selected={moods.includes(mood)} onClick={() => toggleMood(mood)} />
                ))}
              </div>
            </div>
            <label>
              <span className="mb-2 block text-sm font-bold text-zinc-600">写下这一刻的真实感受</span>
              <textarea
                className="soft-input min-h-40"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="多年后再看到这张卡，你会想起今天的自己。"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="secondary-button cursor-pointer">
                <Camera size={18} />
                上传图片
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              <label className="secondary-button cursor-pointer justify-start">
                <input type="checkbox" checked={isAnniversary} onChange={(event) => setIsAnniversary(event.target.checked)} />
                设为纪念日
              </label>
              <label className="secondary-button cursor-pointer justify-start sm:col-span-2">
                <input type="checkbox" checked={shouldGenerateImage} onChange={(event) => setShouldGenerateImage(event.target.checked)} />
                生成 AI 纪念图提示词
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="glass-card overflow-hidden">
            <div className="relative min-h-72 bg-gradient-to-br from-blush via-cream to-skysoft p-6">
              {imageUrl ? <img src={imageUrl} alt="本地预览" className="absolute inset-0 h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-white/35" />
              <div className="relative flex h-full flex-col justify-between gap-24">
                <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-ink">人生卡预览</span>
                <div>
                  <h2 className="text-2xl font-black text-ink">{task.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-700">{note || "完成后，AI 会把你的感受整理成一段纪念文案。"}</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <button className="primary-button w-full" type="submit">
                <Sparkles size={18} />
                生成我的人生卡
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
