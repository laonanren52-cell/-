import type { MoodTag as MoodTagType } from "../../types";

const moodClass: Record<MoodTagType, string> = {
  开心: "bg-yellow-100 text-yellow-800 border-yellow-200",
  平静: "bg-sky-100 text-sky-800 border-sky-200",
  感动: "bg-rose-100 text-rose-800 border-rose-200",
  勇敢: "bg-orange-100 text-orange-800 border-orange-200",
  释然: "bg-emerald-100 text-emerald-800 border-emerald-200",
  紧张: "bg-purple-100 text-purple-800 border-purple-200",
  孤独: "bg-zinc-100 text-zinc-700 border-zinc-200",
  自由: "bg-cyan-100 text-cyan-800 border-cyan-200",
  治愈: "bg-pink-100 text-pink-800 border-pink-200",
  成长: "bg-lime-100 text-lime-800 border-lime-200",
};

export const moodOptions: MoodTagType[] = ["开心", "平静", "感动", "勇敢", "释然", "紧张", "孤独", "自由", "治愈", "成长"];

export function MoodTag({ mood, selected = false, onClick }: { mood: MoodTagType; selected?: boolean; onClick?: () => void }) {
  const className = selected ? "border-ink bg-ink text-white" : moodClass[mood];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${className}`}
    >
      {mood}
    </button>
  );
}
