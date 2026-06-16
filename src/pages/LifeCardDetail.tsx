import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarHeart, Image, Loader2, MapPin, Save, Sparkles } from "lucide-react";
import { LifeCardImage } from "../components/LifeCard/LifeCardImage";
import { MoodPill, moodExamples } from "../components/MoodTag/MoodTag";
import { DotPattern } from "../components/ui/DotPattern";
import { useAppData } from "../services/AppDataContext";
import { generateCardImage } from "../services/aiService";
import { getDisplayLocation } from "../services/reverseGeocodeService";
import type { DiaryEntry } from "../types";
import { formatDate } from "../utils/date";
import { createId } from "../utils/id";

export function LifeCardDetail() {
  const { cardId } = useParams();
  const { profile, lifeCards, updateDiary, updateLifeCard } = useAppData();
  const card = useMemo(() => lifeCards.find((item) => item.id === cardId), [cardId, lifeCards]);
  const [content, setContent] = useState(card?.diary?.content ?? "");
  const [moodText, setMoodText] = useState(card?.diary?.moodText ?? card?.moodText ?? "");
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState("");

  if (!card) {
    return <div className="page-shell"><div className="paper-card p-8">没有找到这张人生卡。</div></div>;
  }

  const displayLocation = getDisplayLocation(card);

  function saveDiary() {
    const diary: DiaryEntry = {
      id: card!.diary?.id ?? createId("diary"),
      cardId: card!.id,
      content,
      moodText,
      imageUrl: card!.imageUrl,
      updatedAt: new Date().toISOString(),
    };
    updateDiary(card!.id, diary);
  }

  async function regenerateImage() {
    if (profile.aiMode !== "api") {
      const message = "当前仍是 Mock 模式，不会调用真实生图接口。请到设置页切换 API 模式。";
      setImageMessage(message);
      updateLifeCard(card!.id, { aiImageError: "当前是 Mock 模式，未调用真实生图接口。" });
      return;
    }

    setRegeneratingImage(true);
    setImageMessage("正在重新生成纪念图...");
    try {
      const imageUrl = await generateCardImage({
        title: card!.title,
        category: card!.category,
        note: card!.note,
        moodText: card!.moodText,
        locationName: card!.locationName || card!.locationAddress || card!.location,
        preferences: profile.aiPreferences,
        aiMode: profile.aiMode,
        shouldGenerateImage: true,
      });
      if (!imageUrl) throw new Error("接口成功但没有解析到图片 URL，请检查返回值格式。");
      updateLifeCard(card!.id, { imageUrl, imageSource: "ai", aiImageError: undefined });
      setImageMessage("纪念图已重新生成。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 生图失败，请稍后再试。";
      setImageMessage(message);
      updateLifeCard(card!.id, { aiImageError: message });
    } finally {
      setRegeneratingImage(false);
    }
  }

  return (
    <div className="page-shell grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="overflow-hidden rounded-[36px] border border-white/80 bg-[#FBFAF7] shadow-[0_16px_48px_rgba(30,30,30,0.07)] animate-soft-scale">
        <div className="relative h-[330px] overflow-hidden sm:h-[420px]">
          <LifeCardImage imageUrl={card.imageUrl} imageSource={card.imageSource} title={card.title} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/22 via-transparent to-black/12" />
          <div className="absolute left-5 top-5 max-w-[58%] truncate rounded-full bg-white/92 px-4 py-2 text-xs font-black text-[#1f1f1f] shadow-sm">
            {card.category || "人生卡"}
          </div>
          <div className="absolute right-5 top-5 rounded-full bg-[#1f1f1f]/86 px-4 py-2 text-xs font-black text-white shadow-sm">
            {card.imageSource === "uploaded" ? "用户照片" : card.imageSource === "ai" ? "AI 图" : "默认卡"}
          </div>
        </div>
        <div className="space-y-4 p-7 sm:p-8 animate-fade-up">
          <p className="flex items-center gap-2 text-sm font-black text-[#A8B8AE]">
            <Sparkles size={16} />
            AI 纪念文案
          </p>
          <h1 className="break-words text-3xl font-black leading-tight text-[#1f1f1f] sm:text-4xl">{card.title}</h1>
          <p className="whitespace-pre-line break-words text-base font-medium leading-8 text-[#626262]">
            {card.aiGeneratedText || "这张人生卡已经被认真保存下来。"}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="paper-card p-6 animate-fade-up">
          <p className="mb-4 inline-flex rounded-full bg-[#F2F0EA] px-3 py-1 text-sm font-black text-[#626262]">{card.moodText}</p>
          <div className="grid gap-3 text-sm font-medium leading-7 text-[#626262] sm:grid-cols-2">
            <p><span className="font-black text-[#1f1f1f]">完成时间：</span>{formatDate(card.completedAt, true)}</p>
            <p className="flex items-center gap-2"><MapPin size={17} /><span className="font-black text-[#1f1f1f]">地点：</span>{displayLocation}</p>
            {card.locationAddress && card.locationAddress !== displayLocation ? (
              <p className="break-words sm:col-span-2"><span className="font-black text-[#1f1f1f]">详细地址：</span>{card.locationAddress}</p>
            ) : null}
            <p className="break-words sm:col-span-2"><span className="font-black text-[#1f1f1f]">原始感受：</span>{card.note}</p>
            <p className="flex items-center gap-2"><CalendarHeart size={17} />{card.isAnniversary ? "已转化为纪念日" : "普通人生卡"}</p>
          </div>
          {card.isAnniversary ? <Link to="/anniversaries" className="secondary-button mt-5">查看纪念日</Link> : null}
        </div>

        <div className="paper-card p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-black text-[#A8B8AE]">
            <Image size={17} />
            图片记录
          </p>
          <p className="text-sm font-medium leading-7 text-[#626262]">
            {card.imageSource === "uploaded"
              ? "这张人生卡使用了你上传的真实照片。"
              : card.imageSource === "ai"
                ? "这张人生卡使用 AI 根据任务、感受和情绪生成的纪念图。"
                : "这张人生卡使用默认的温和视觉背景。"}
          </p>
          {card.aiImageError ? <p className="mt-3 rounded-[24px] bg-rose-50 p-4 text-sm font-medium leading-7 text-rose-800">{card.aiImageError}</p> : null}
          {card.imageSource === "default" || !card.imageUrl ? (
            <button className="secondary-button mt-4" type="button" onClick={regenerateImage} disabled={regeneratingImage}>
              {regeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {regeneratingImage ? "正在重新生成纪念图..." : "重新生成 AI 图片"}
            </button>
          ) : null}
          {imageMessage ? <p className="mt-3 text-sm font-bold leading-7 text-[#626262]">{imageMessage}</p> : null}
        </div>

        <div className="paper-card relative overflow-hidden p-6">
          <DotPattern opacity={0.14} />
          <div className="relative z-10">
            <h2 className="section-title">小日记</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-[#626262]">写下这一刻的真实感受。多年后再看到这张卡，你会想起今天的自己。</p>
            <textarea className="soft-input mt-4 min-h-36" value={content} onChange={(event) => setContent(event.target.value)} />
            <input className="soft-input mt-3" value={moodText} onChange={(event) => setMoodText(event.target.value)} placeholder="补充这一刻的情绪" />
            <div className="mt-3 flex flex-wrap gap-2">
              {moodExamples.map((item) => <MoodPill key={item} text={item} selected={moodText === item} onClick={() => setMoodText(item)} />)}
            </div>
            <button className="primary-button mt-5" type="button" onClick={saveDiary}>
              <Save size={18} />
              保存日记
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
