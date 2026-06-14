import { Plus } from "lucide-react";
import type { ReviewSuggestion } from "../../types";

export function ReviewSuggestionCard({
  suggestion,
  onAdd,
  added,
}: {
  suggestion: ReviewSuggestion;
  onAdd: () => void;
  added?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-orange-100/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-black leading-6 text-ink">{suggestion.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{suggestion.reason}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50 p-2 text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
          title={added ? "已加入今日待办" : "加入今日待办"}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold leading-6 text-orange-900">
        {suggestion.action}
      </div>
      {added ? <p className="mt-3 text-sm font-bold text-emerald-700">已加入今日待办。</p> : null}
    </article>
  );
}
