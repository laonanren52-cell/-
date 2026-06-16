import { Calendar, Image as ImageIcon, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeCard } from "../../types";
import { getDisplayLocation } from "../../services/reverseGeocodeService";
import { formatDate } from "../../utils/date";
import { LifeCardImage } from "./LifeCardImage";

export function LifeCardPreview({ card, compact = false }: { card: LifeCard; compact?: boolean }) {
  const displayLocation = getDisplayLocation(card);
  const imageLabel = card.imageSource === "uploaded" ? "用户照片" : card.imageSource === "ai" ? "AI 图" : "默认卡";
  const summary = card.aiGeneratedText || card.note || "这张人生卡记录了一个真实完成的生活片段。";
  const moods = (card.moodText || "平静").split(/[，、\s]/).filter(Boolean);
  const visibleMoods = moods.slice(0, 2);
  const hiddenMoodCount = Math.max(moods.length - visibleMoods.length, 0);

  return (
    <Link
      to={`/cards/${card.id}`}
      className="group block h-full overflow-hidden rounded-[30px] border border-white/80 bg-[#FBFAF7] shadow-[0_12px_40px_rgba(30,30,30,0.06)] transition duration-500 hover:-translate-y-1 hover:bg-white"
    >
      <div className="relative h-44 overflow-hidden">
        <LifeCardImage imageUrl={card.imageUrl} imageSource={card.imageSource} title={card.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/10" />
        <span className="absolute left-3 top-3 max-w-[62%] truncate rounded-full bg-white/92 px-3 py-1 text-xs font-black text-[#1f1f1f] shadow-sm">
          {card.category || "人生支线"}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-[#1f1f1f]/88 px-3 py-1 text-xs font-black text-white shadow-sm">
          {imageLabel}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 text-lg font-black leading-6 text-[#1f1f1f]">{card.title}</h3>
        <p className="line-clamp-3 text-sm font-medium leading-6 text-[#626262]">{summary}</p>
        <div className="flex flex-wrap gap-2">
          {visibleMoods.map((mood) => (
            <span key={mood} className="rounded-full bg-[#F2F0EA] px-3 py-1 text-xs font-black text-[#626262]">
              {mood}
            </span>
          ))}
          {hiddenMoodCount ? (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#8b8b86]">+{hiddenMoodCount}</span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#626262]">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(card.completedAt)}
          </span>
          <span className="inline-flex min-w-0 flex-1 items-center justify-end gap-1">
            <MapPin size={14} className="shrink-0" />
            <span className="max-w-[120px] truncate">{displayLocation}</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-black text-[#A8B8AE]">
          {card.imageSource === "uploaded" ? <ImageIcon size={14} /> : <Sparkles size={14} />}
          {compact ? "查看" : "人生卡"}
        </span>
      </div>
    </Link>
  );
}
