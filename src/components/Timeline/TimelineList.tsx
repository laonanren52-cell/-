import type { LifeCard } from "../../types";
import { groupCardsByMonth } from "../../utils/date";
import { LifeCardPreview } from "../LifeCard/LifeCardPreview";

export function TimelineList({ cards }: { cards: LifeCard[] }) {
  const groups = groupCardsByMonth(cards);

  if (!cards.length) {
    return <div className="glass-card p-8 text-center text-sm text-zinc-500">还没有匹配的人生卡，去完成一条支线吧。</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([month, monthCards]) => (
        <section key={month} className="relative">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <h2 className="text-lg font-black text-ink">{month}</h2>
            <span className="text-sm text-zinc-500">{monthCards.length} 张人生卡</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {monthCards.map((card) => (
              <LifeCardPreview key={card.id} card={card} compact />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
