import { Calendar, Image as ImageIcon, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { LifeCard } from "../../types";
import { getDisplayLocation } from "../../services/reverseGeocodeService";
import { formatDate } from "../../utils/date";
import { LifeCardImage } from "./LifeCardImage";

export function LifeCardPreview({ card, compact = false }: { card: LifeCard; compact?: boolean }) {
  const displayLocation = getDisplayLocation(card);

  return (
    <Link
      to={`/cards/${card.id}`}
      className="group glass-card block overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
    >
      <LifeCardImage imageUrl={card.imageUrl} imageSource={card.imageSource} title={card.title} className="min-h-40 p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/10" />
        <div className="relative flex h-full min-h-32 flex-col justify-between gap-8">
          <div className="flex justify-between gap-3">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-ink">{card.category || "人生支线"}</span>
            <span className="rounded-full bg-ink/85 px-3 py-1 text-xs font-bold text-white">
              {card.imageSource === "uploaded" ? "用户照片" : card.imageSource === "ai" ? "AI 图" : "记录卡"}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-black text-ink">{card.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700">{card.aiGeneratedText}</p>
          </div>
        </div>
      </LifeCardImage>
      <div className="space-y-3 p-5">
        <p className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{card.moodText}</p>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(card.completedAt)}
          </span>
          {displayLocation ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {displayLocation}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-coral">
            {card.imageSource === "uploaded" ? <ImageIcon size={14} /> : <Sparkles size={14} />}
            {compact ? "查看" : "人生卡"}
          </span>
        </div>
      </div>
    </Link>
  );
}
