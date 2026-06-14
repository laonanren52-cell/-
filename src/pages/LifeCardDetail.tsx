import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarHeart, Image, Save, Sparkles } from "lucide-react";
import { MoodTag, moodOptions } from "../components/MoodTag/MoodTag";
import { useAppData } from "../services/AppDataContext";
import type { DiaryEntry, MoodTag as MoodTagType } from "../types";
import { createId } from "../utils/id";
import { formatDate } from "../utils/date";

export function LifeCardDetail() {
  const { cardId } = useParams();
  const { lifeCards, updateDiary } = useAppData();
  const card = useMemo(() => lifeCards.find((item) => item.id === cardId), [cardId, lifeCards]);
  const [content, setContent] = useState(card?.diary?.content ?? "");
  const [moods, setMoods] = useState<MoodTagType[]>(card?.diary?.moodTags ?? card?.moodTags ?? []);

  if (!card) {
    return <div className="page-shell"><div className="glass-card p-8">没有找到这张人生卡。</div></div>;
  }

  function saveDiary() {
    const diary: DiaryEntry = {
      id: card!.diary?.id ?? createId("diary"),
      cardId: card!.id,
      content,
      moodTags: moods,
      imageUrl: card!.imageUrl,
      updatedAt: new Date().toISOString(),
    };
    updateDiary(card!.id, diary);
  }

  function toggleMood(mood: MoodTagType) {
    setMoods((current) => (current.includes(mood) ? current.filter((item) => item !== mood) : [...current, mood]));
  }

  return (
    <div className="page-shell grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-card overflow-hidden">
        <div className="relative min-h-[520px] bg-gradient-to-br from-blush via-cream to-skysoft p-7">
          {card.imageUrl ? <img src={card.imageUrl} alt={card.title} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-br from-white/55 to-white/10" />
          <div className="relative flex min-h-[460px] flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-black text-ink">{card.category}</span>
              {card.isAnniversary ? (
                <Link to="/anniversaries" className="rounded-full bg-ink px-4 py-2 text-xs font-black text-white">
                  纪念日
                </Link>
              ) : null}
            </div>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-600">
                <Sparkles size={16} />
                AI 纪念文案
              </p>
              <h1 className="text-4xl font-black leading-tight text-ink">{card.title}</h1>
              <p className="mt-5 text-lg leading-9 text-zinc-700">{card.aiGeneratedText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="glass-card p-6">
          <div className="flex flex-wrap gap-2">
            {card.moodTags.map((mood) => (
              <MoodTag key={mood} mood={mood} />
            ))}
          </div>
          <div className="mt-5 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
            <p><span className="font-bold text-ink">完成时间：</span>{formatDate(card.completedAt, true)}</p>
            <p><span className="font-bold text-ink">地点：</span>{card.location || "未记录"}</p>
            <p><span className="font-bold text-ink">原始感受：</span>{card.note}</p>
            <p className="flex items-center gap-2"><CalendarHeart size={17} />{card.isAnniversary ? "已转化为纪念日" : "普通人生卡"}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-black text-coral">
            <Image size={17} />
            AI 绘图提示词
          </p>
          <p className="rounded-2xl bg-white/75 p-4 text-sm leading-7 text-zinc-700">{card.aiImagePrompt}</p>
        </div>

        <div className="glass-card p-6">
          <h2 className="section-title">小日记</h2>
          <p className="mt-2 text-sm text-zinc-500">写下这一刻的真实感受。多年后再看到这张卡，你会想起今天的自己。</p>
          <textarea className="soft-input mt-4 min-h-36" value={content} onChange={(event) => setContent(event.target.value)} />
          <div className="mt-4 flex flex-wrap gap-2">
            {moodOptions.map((mood) => (
              <MoodTag key={mood} mood={mood} selected={moods.includes(mood)} onClick={() => toggleMood(mood)} />
            ))}
          </div>
          <button className="primary-button mt-5" type="button" onClick={saveDiary}>
            <Save size={18} />
            保存日记
          </button>
        </div>
      </section>
    </div>
  );
}
