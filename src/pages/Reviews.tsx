import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { LifeCardPreview } from "../components/LifeCard/LifeCardPreview";
import { ReviewCategoryChart } from "../components/Review/ReviewCategoryChart";
import { ReviewEmptyState } from "../components/Review/ReviewEmptyState";
import { ReviewMoodChart } from "../components/Review/ReviewMoodChart";
import { ReviewStatCards } from "../components/Review/ReviewStatCards";
import { ReviewSuggestionCard } from "../components/Review/ReviewSuggestionCard";
import { ReviewTrendChart } from "../components/Review/ReviewTrendChart";
import { TimelineList } from "../components/Timeline/TimelineList";
import { useAppData } from "../services/AppDataContext";
import { generateNextTaskSuggestions, generateReviewSummary } from "../services/aiService";
import { buildReviewStats, getCardsByPeriod, getPeriodLabel, getPreviousPeriodCards } from "../services/reviewService";
import type { ReviewPeriod, ReviewSuggestion } from "../types";

const periodOptions: Array<{ key: ReviewPeriod; label: string; settingKey?: "daily" | "weekly" | "monthly"; note: string }> = [
  { key: "daily", label: "日复盘", settingKey: "daily", note: "设置可关闭" },
  { key: "weekly", label: "周复盘", settingKey: "weekly", note: "设置可关闭" },
  { key: "monthly", label: "月复盘", settingKey: "monthly", note: "设置可关闭" },
  { key: "quarterly", label: "季复盘", note: "系统保留" },
  { key: "yearly", label: "年复盘", note: "系统保留" },
];

const validPeriods = new Set<ReviewPeriod>(["daily", "weekly", "monthly", "quarterly", "yearly"]);

export function Reviews() {
  const { lifeCards, tasks, profile, reviewSettings, createTodo } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPeriod = normalizePeriod(searchParams.get("period"));
  const fallbackPeriod = periodOptions.find((item) => isEnabled(item.key, reviewSettings))?.key || "quarterly";
  const period = isEnabled(requestedPeriod, reviewSettings) ? requestedPeriod : fallbackPeriod;
  const periodLabel = getPeriodLabel(period);

  const periodCards = useMemo(() => getCardsByPeriod(lifeCards, period), [lifeCards, period]);
  const previousCards = useMemo(() => getPreviousPeriodCards(lifeCards, period), [lifeCards, period]);
  const stats = useMemo(() => buildReviewStats(periodCards, previousCards, period), [period, periodCards, previousCards]);
  const [aiSummary, setAiSummary] = useState("");
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [addedTitles, setAddedTitles] = useState<string[]>([]);

  useEffect(() => {
    if (period !== requestedPeriod) {
      setSearchParams({ period }, { replace: true });
    }
  }, [period, requestedPeriod, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setAddedTitles([]);

    if (!periodCards.length) {
      setAiSummary("");
      setSuggestions([]);
      setIsAiLoading(false);
      return;
    }

    async function buildAiReview() {
      setIsAiLoading(true);
      const [summary, nextSuggestions] = await Promise.all([
        generateReviewSummary({
          cards: periodCards,
          periodLabel,
          periodType: period,
          stats,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        }),
        generateNextTaskSuggestions({
          cards: periodCards,
          tasks,
          periodType: period,
          stats,
          preferences: profile.aiPreferences,
          aiMode: profile.aiMode,
        }),
      ]);
      if (!cancelled) {
        setAiSummary(summary);
        setSuggestions(nextSuggestions.slice(0, 3));
        setIsAiLoading(false);
      }
    }

    buildAiReview().catch((error) => {
      console.warn("[Review] failed to build AI review", error);
      if (!cancelled) {
        setAiSummary("这段复盘暂时没有生成成功，但你的真实人生卡已经保存好了。稍后切换周期或重试时，会继续基于这些记录生成总结。");
        setSuggestions([]);
        setIsAiLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [period, periodCards, periodLabel, profile.aiMode, profile.aiPreferences, stats, tasks]);

  function selectPeriod(nextPeriod: ReviewPeriod) {
    if (!isEnabled(nextPeriod, reviewSettings)) return;
    setSearchParams({ period: nextPeriod });
  }

  function addSuggestionToTodo(suggestion: ReviewSuggestion) {
    const today = new Date().toISOString().slice(0, 10);
    createTodo({
      title: suggestion.title,
      description: `${suggestion.reason}\n${suggestion.action}`,
      date: today,
    });
    setAddedTitles((current) => [...current, suggestion.title]);
  }

  return (
    <div className="page-shell space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-coral">人生轨迹可视化复盘</p>
            <h1 className="section-title mt-2">把真实完成的人生卡，整理成看得见的生活轨迹</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600">
              复盘会读取当前周期内的 LifeCard，统计分类、情绪、趋势和代表卡，再生成具体的阶段总结与下一步建议。
            </p>
          </div>
          <Link to="/settings" className="secondary-button self-start lg:self-auto">复盘设置</Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {periodOptions.map((item) => {
            const enabled = isEnabled(item.key, reviewSettings);
            const selected = period === item.key;
            return (
              <button
                key={item.key}
                type="button"
                disabled={!enabled}
                onClick={() => selectPeriod(item.key)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                  selected
                    ? "bg-ink text-white shadow-sm"
                    : enabled
                      ? "bg-white text-zinc-700 hover:-translate-y-0.5 hover:bg-orange-50"
                      : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                }`}
                title={enabled ? item.note : "已在设置中关闭"}
              >
                <span>{item.label}</span>
                <span className="ml-2 text-xs opacity-70">{enabled ? item.note : "已关闭"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <ReviewStatCards stats={stats} periodLabel={periodLabel} />

      {!periodCards.length ? <ReviewEmptyState periodLabel={periodLabel} /> : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <ReviewCategoryChart data={stats.categoryDistribution} />
          <ReviewMoodChart data={stats.moodDistribution} />
          <ReviewTrendChart data={stats.dailyTrend} />

          {periodCards.length ? (
            <section className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-ink">本周期真实记录</h2>
                  <p className="mt-1 text-sm text-zinc-500">按完成时间排列，方便回到原始卡片。</p>
                </div>
                <CheckCircle2 className="text-orange-500" size={22} />
              </div>
              <TimelineList cards={periodCards} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-ink">代表性人生卡</h2>
                <p className="mt-1 text-sm text-zinc-500">优先展示有图、有文案、记录更完整的卡片。</p>
              </div>
              <Sparkles className="text-orange-500" size={22} />
            </div>
            <div className="space-y-4">
              {stats.representativeCards.length ? (
                stats.representativeCards.map((card) => <LifeCardPreview key={card.id} card={card} compact />)
              ) : (
                <p className="rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">
                  这里会展示本周期最有代表性的 1-3 张人生卡。
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-ink">AI 阶段总结</h2>
            <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-950">
              {periodCards.length
                ? isAiLoading
                  ? "正在根据当前周期内的真实人生卡生成总结..."
                  : aiSummary
                : "这个周期还没有足够内容生成复盘。完成一次打卡后，我会帮你把这些生活片段整理成阶段总结。"}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-orange-100/70 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-ink">下一步建议</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">每条建议都可以一键加入今日待办。</p>
            </div>
            {periodCards.length ? (
              isAiLoading && !suggestions.length ? (
                <p className="rounded-2xl border border-orange-100/70 bg-white p-5 text-sm leading-7 text-zinc-600 shadow-sm">
                  正在从你的真实记录里挑下一条小支线...
                </p>
              ) : suggestions.length ? (
                suggestions.map((suggestion) => (
                  <ReviewSuggestionCard
                    key={suggestion.title}
                    suggestion={suggestion}
                    added={addedTitles.includes(suggestion.title)}
                    onAdd={() => addSuggestionToTodo(suggestion)}
                  />
                ))
              ) : (
                <p className="rounded-2xl border border-orange-100/70 bg-white p-5 text-sm leading-7 text-zinc-600 shadow-sm">
                  暂时没有生成建议，可以先从任务库里挑一条轻松支线。
                </p>
              )
            ) : (
              <p className="rounded-2xl border border-orange-100/70 bg-white p-5 text-sm leading-7 text-zinc-600 shadow-sm">
                有了第一张人生卡后，这里会根据你的分类和情绪生成下一步建议。
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function normalizePeriod(value: string | null): ReviewPeriod {
  return validPeriods.has(value as ReviewPeriod) ? (value as ReviewPeriod) : "weekly";
}

function isEnabled(period: ReviewPeriod, settings: { daily: boolean; weekly: boolean; monthly: boolean }) {
  if (period === "daily" || period === "weekly" || period === "monthly") return settings[period];
  return true;
}
