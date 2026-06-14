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

  return (
    <Link
      to={`/cards/${card.id}`}
      className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative h-48 shrink-0 overflow-hidden">
        <LifeCardImage imageUrl={card.imageUrl} imageSource={card.imageSource} title={card.title} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
        <span className="absolute left-3 top-3 max-w-[60%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink shadow-sm">
          {card.category || "人生支线"}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white shadow-sm">
          {imageLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-black leading-6 text-ink">{card.title}</h3>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600">{summary}</p>
        <p className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{card.moodText || "平静"}</p>
        <div className="mt-auto flex items-center justify-between gap-3 text-xs font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(card.completedAt)}
          </span>
          <span className="inline-flex min-w-0 flex-1 items-center justify-end gap-1">
            <MapPin size={14} className="shrink-0" />
            <span className="max-w-[120px] truncate">
              {displayLocation}
            </span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-coral">
          {card.imageSource === "uploaded" ? <ImageIcon size={14} /> : <Sparkles size={14} />}
          {compact ? "查看" : "人生卡"}
        </span>
      </div>
    </Link>
  );
}
